// @vitest-environment jsdom
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import type { Resume } from '../lib/resume/engine';
const mock = vi.hoisted(() => ({ mutate: vi.fn(), reload: vi.fn(), setMessage: vi.fn(), setError: vi.fn(), setBusy: vi.fn(), fetch: vi.fn() }));
const resume: Resume = { title: 'Project Manager', language: 'pl', template: 'executive_clarity', headline: 'Rola docelowa: Project Manager', summary: 'Koordynacja projektów.', sections: [{ id: 'skill', title: 'Kompetencje', hidden: false, claims: [{ text: 'Koordynacja projektów.', factIds: ['11111111-1111-4111-8111-111111111111'] }] }] };
vi.mock('../components/workspace-state', () => ({
    Header: ({ title }: {
        title: string;
    }) => React.createElement('h1', null, title), Loading: () => React.createElement('p', null, 'Loading'), Status: () => null,
    confirmed: (fact: {
        verification_status: string;
    }) => fact.verification_status === 'user_confirmed',
    useWorkspace: () => ({ data: { cvs: [{ id: 'cv-1', title: 'Project Manager', content: resume, approved: false }], facts: [{ id: '11111111-1111-4111-8111-111111111111', statement: 'Koordynacja projektów.', fact_type: 'skill', verification_status: 'user_confirmed' }] }, busy: false, mutate: mock.mutate, reload: mock.reload, setError: mock.setError, setMessage: mock.setMessage, setBusy: mock.setBusy })
}));
vi.mock('../lib/demo/transport', () => ({ workspaceFetch: (...args: unknown[]) => mock.fetch(...args), demoPath: (p: string) => p, isDemo: () => false }));
import { CvEditor, ResumePreview } from '../components/resume/editor';
import { CareerStory } from '../components/career/story';
afterEach(() => { cleanup(); vi.clearAllMocks(); });
beforeEach(() => { mock.mutate.mockResolvedValue({ ok: true }); mock.reload.mockResolvedValue(undefined); });
describe('Career Atelier editing', () => {
    it('preserves evidence IDs when editing style and asks for editorial confirmation', async () => {
        render(<CvEditor id="cv-1"/>);
        await waitFor(() => expect(screen.getByText('Kompetencje', { selector: 'summary span' })).toBeTruthy());
        const textarea = screen.getByLabelText('Kompetencje — wpis 1');
        fireEvent.change(textarea, { target: { value: 'Prowadzenie koordynacji projektów.' } });
        fireEvent.click(screen.getByLabelText('Potwierdzam brzmienie bez zmiany faktów'));
        fireEvent.click(screen.getByRole('button', { name: 'Zapisz szkic' }));
        await waitFor(() => expect(mock.mutate).toHaveBeenCalled());
        const sent = mock.mutate.mock.calls[0][0];
        expect(sent.action).toBe('saveCv');
        expect(sent.approved).toBe(false);
        expect(sent.content.sections[0].claims[0]).toEqual({ text: 'Prowadzenie koordynacji projektów.', factIds: ['11111111-1111-4111-8111-111111111111'], editorialApproved: true });
        expect(mock.mutate.mock.calls.some(call => call[0].action === 'fact')).toBe(false);
    });
    it('offers mobile preview and edit tabs without discarding a draft', async () => {
        render(<CvEditor id="cv-1"/>);
        await waitFor(() => expect(screen.getByLabelText('Kompetencje — wpis 1')).toBeTruthy());
        fireEvent.click(screen.getByRole('tab', { name: 'Edycja' }));
        fireEvent.change(screen.getByLabelText('Kompetencje — wpis 1'), { target: { value: 'Nowe brzmienie opisu.' } });
        fireEvent.click(screen.getByRole('tab', { name: 'Podgląd' }));
        expect(screen.getByRole('tab', { name: 'Podgląd' }).getAttribute('aria-selected')).toBe('true');
        fireEvent.click(screen.getByRole('tab', { name: 'Edycja' }));
        expect((screen.getByLabelText('Kompetencje — wpis 1') as HTMLTextAreaElement).value).toBe('Nowe brzmienie opisu.');
    });
    it('shows chronology newest first and saves inline without falsely confirming data', async () => {
        const data = { work_experiences: [{ id: 'old', employer: 'First Company', position: 'Engineer', start_date: '2018-01-01', end_date: '2020-01-01' }, { id: 'new', employer: 'Second Company', position: 'Manager', start_date: '2021-01-01', end_date: null }], projects: [], achievements: [], skills: [], education: [], certifications: [], languages: [] };
        mock.fetch.mockImplementation(async (_url: string, options?: RequestInit) => ({ ok: true, json: async () => options ? { ok: true } : data }));
        render(<CareerStory onSaved={mock.reload}/>);
        await waitFor(() => expect(screen.getByRole('heading', { name: 'Manager' })).toBeTruthy());
        const roles = screen.getAllByRole('heading', { level: 3 }).map(heading => heading.textContent);
        expect(roles.indexOf('Manager')).toBeLessThan(roles.indexOf('Engineer'));
        fireEvent.click(screen.getByRole('button', { name: 'Edytuj Second Company' }));
        fireEvent.change(screen.getByLabelText('Stanowisko *'), { target: { value: 'Senior Manager' } });
        fireEvent.click(screen.getByRole('button', { name: 'Zapisz w historii' }));
        await waitFor(() => expect(mock.reload).toHaveBeenCalled());
        const call = mock.fetch.mock.calls.find(call => call[1]?.method === 'POST');
        const payload = JSON.parse(call![1].body as string);
        expect(payload.entity).toBe('work_experiences');
        expect(payload.id).toBe('new');
        expect(payload.data.position).toBe('Senior Manager');
        expect(payload.data.verification_status).toBeUndefined();
    });
    it('preview honors chronology position, hidden sections and unknown employment end dates', () => {
        const entry = { id: 'role-1', employer: 'Fictional Company', position: 'Manager', startDate: '2020-01-01', endDate: null, factIds: ['11111111-1111-4111-8111-111111111111'], claims: [{ text: 'Role contribution.', factIds: ['11111111-1111-4111-8111-111111111111'] }] };
        const document: Resume = { ...resume, employment: [entry], sections: [resume.sections[0], { id: 'experience', title: 'Historia zatrudnienia', hidden: false, claims: [{ text: 'Unassigned employment evidence.', factIds: ['11111111-1111-4111-8111-111111111111'] }] }] };
        const view = render(<ResumePreview resume={document}/>);
        const headings = screen.getAllByRole('heading', { level: 2 }).map(heading => heading.textContent);
        expect(headings.indexOf('Kompetencje')).toBeLessThan(headings.indexOf('Historia zatrudnienia'));
        expect(screen.queryByText(/obecnie/)).toBeNull();
        expect(screen.getByText('Unassigned employment evidence.')).toBeTruthy();
        view.rerender(<ResumePreview resume={{ ...document, sections: document.sections.map(section => section.id === 'experience' ? { ...section, hidden: true } : section) }}/>);
        expect(screen.queryByText('Manager · Fictional Company')).toBeNull();
        expect(screen.queryByText('Unassigned employment evidence.')).toBeNull();
    });
});
