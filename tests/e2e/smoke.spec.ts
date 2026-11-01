import {expect,test} from '@playwright/test';
test('public navigation, responsive layout and auth recovery',async({page})=>{
 await page.goto('/');await expect(page.getByRole('heading',{name:/Nie zaczynasz.*od pustej kartki/})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.getByRole('link',{name:'Zaloguj się',exact:true}).click();await expect(page.getByRole('heading',{name:'Dobrze Cię widzieć'})).toBeVisible();
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
 await page.goto('/interview/A');const input=page.getByRole('textbox').first();const value='Synthetic staging QA answer: managed fictional infrastructure delivery.';await input.fill(value);await expect(page.getByText('Szkic zapisany',{exact:true})).toBeVisible();await page.reload();await expect(page.getByRole('textbox').first()).toHaveValue(value);
});

});

// Public synthetic review path exercises the same UI without external credentials.
test('review demo navigates, persists answers and exports approved documents',async({page})=>{
 await page.goto('/demo');await expect(page.getByRole('heading',{name:/Historia, która.*pracuje na Ciebie/})).toBeVisible();await page.getByRole('link',{name:'Moje dokumenty',exact:true}).click();
 await page.getByRole('link',{name:/Senior Project Manager/}).click();await expect(page.getByRole('heading',{name:'Senior Project Manager',exact:true})).toBeVisible();
 for(const format of ['PDF','DOCX']){await page.getByLabel('Format dokumentu').selectOption(format.toLowerCase());const downloaded=page.waitForEvent('download');await page.getByRole('button',{name:'Sprawdź i pobierz',exact:true}).click();expect((await downloaded).suggestedFilename()).toBe(`MatchCV.${format.toLowerCase()}`);}
 await page.getByRole('link',{name:'Moja kariera',exact:true}).click();await page.getByRole('link',{name:'Kontynuuj rozmowę',exact:true}).click();await page.getByRole('link').filter({hasText:/Obszar A/i}).click();
 const answer=page.getByRole('textbox').first();await expect(page.getByRole('textbox')).toHaveCount(1);await answer.fill('Synthetic review demonstration answer.');await expect(page.getByText('Szkic zapisany',{exact:true})).toBeVisible();await page.reload();await expect(page.getByRole('textbox').first()).toHaveValue('Synthetic review demonstration answer.');
});
