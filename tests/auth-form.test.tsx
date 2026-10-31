// @vitest-environment jsdom
import React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { AuthForm } from '../components/auth-form';
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }), usePathname: () => '/login' }));
vi.mock('../components/shell', () => ({ Brand: () => React.createElement('span', null, 'MatchCV') }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
describe('authentication UI', () => {
    it('shows provider errors without losing entered email', async () => {
        vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ error: 'Email verification required.' }) }));
        render(<AuthForm mode="login"/>);
        fireEvent.change(screen.getByLabelText('Adres e-mail'), { target: { value: 'candidate@example.test' } });
        fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'long-secure-password' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Zaloguj się' }).closest('form')!);
        await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Email verification required.'));
        expect((screen.getByLabelText('Adres e-mail') as HTMLInputElement).value).toBe('candidate@example.test');
    });
    it('disables submission while authentication is pending', async () => {
        let resolve: (value: unknown) => void = () => { };
        vi.stubGlobal('fetch', vi.fn().mockImplementation(() => new Promise(r => { resolve = r; })));
        render(<AuthForm mode="register"/>);
        fireEvent.change(screen.getByLabelText('Adres e-mail'), { target: { value: 'candidate@example.test' } });
        fireEvent.change(screen.getByLabelText('Hasło'), { target: { value: 'long-secure-password' } });
        fireEvent.submit(screen.getByRole('button', { name: 'Utwórz konto' }).closest('form')!);
        await waitFor(() => expect((screen.getByRole('button', { name: 'Chwilę…' }) as HTMLButtonElement).disabled).toBe(true));
        resolve({ ok: true, json: async () => ({ message: 'Check your email.' }) });
        await waitFor(() => expect(screen.getByRole('status').textContent).toContain('Check your email.'));
    });
    it('offers a password-reset form that only asks for email', () => {
        render(<AuthForm mode="login"/>);
        fireEvent.click(screen.getByRole('button', { name: 'Nie pamiętasz hasła?' }));
        expect(screen.queryByLabelText('Hasło')).toBeNull();
        expect(screen.getByRole('button', { name: 'Wyślij link' })).toBeTruthy();
    });
    it('does not send a retained password when requesting recovery', async () => {
        const fetchMock = vi.fn().mockResolvedValue({ok:true,json:async()=>({message:'Check your email.'})});
        vi.stubGlobal('fetch',fetchMock);
        render(<AuthForm mode="login"/>);
        fireEvent.change(screen.getByLabelText('Adres e-mail'),{target:{value:'candidate@example.test'}});
        fireEvent.click(screen.getByRole('button',{name:'Nie pamiętasz hasła?'}));
        fireEvent.submit(screen.getByRole('button',{name:'Wyślij link'}).closest('form')!);
        await waitFor(()=>expect(fetchMock).toHaveBeenCalledOnce());
        expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({action:'reset',email:'candidate@example.test'});
    });
});
