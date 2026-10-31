import {expect,test} from '@playwright/test';
test('public navigation, responsive layout and auth recovery',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:'Dobre CV zaczyna się od prawdziwej historii.'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.getByRole('link',{name:'Wróć do pracy nad CV'}).click();await expect(page.getByRole('heading',{name:'Dobrze Cię widzieć'})).toBeVisible();
 await page.getByRole('button',{name:'Nie pamiętasz hasła?'}).click();await expect(page.getByRole('heading',{name:'Odzyskaj dostęp'})).toBeVisible();await expect(page.getByLabel('Hasło',{exact:true})).toHaveCount(0);
 await page.goto('/register');await expect(page.getByRole('heading',{name:'Zacznij swoją historię'})).toBeVisible();
});
test('protected page cannot expose career data anonymously',async({page})=>{
 await page.goto('/dashboard');
 await expect(page.getByRole('heading',{name:/Dobrze Cię widzieć|MatchCV — konfiguracja/})).toBeVisible();
 await expect(page.getByText('Fakty gotowe do CV',{exact:true})).toHaveCount(0);
});
test.describe('configured staging',()=>{
 test.skip(!process.env.E2E_EMAIL||!process.env.E2E_PASSWORD,'Requires dedicated staging credentials and configured Supabase.');
 test('login and interview persistence',async({page})=>{
 await page.goto('/login');await page.getByLabel('Adres e-mail').fill(process.env.E2E_EMAIL!);await page.getByLabel('Hasło',{exact:true}).fill(process.env.E2E_PASSWORD!);await page.getByRole('button',{name:'Zaloguj się',exact:true}).click();await expect(page).toHaveURL(/dashboard/);
 await page.goto('/interview/A');const input=page.getByRole('textbox').first();const value='Synthetic staging QA answer: managed fictional infrastructure delivery.';await input.fill(value);await page.getByRole('button',{name:'Zapisz odpowiedź',exact:true}).first().click();await expect(page.getByRole('status')).toContainText('zapisane');await page.reload();await expect(page.getByRole('textbox').first()).toHaveValue(value);
});

});
