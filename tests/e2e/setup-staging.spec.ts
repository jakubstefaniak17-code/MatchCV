import {test,expect} from '@playwright/test';
import {Document,Paragraph,Packer} from 'docx';
// Real staging only: provide a verified, fresh synthetic account. No service mocks or auth bypass.
test.describe('Career Setup real staging acceptance',()=>{
 test.skip(!process.env.E2E_SETUP_EMAIL||!process.env.E2E_SETUP_PASSWORD,'Requires configured staging and a fresh verified synthetic account.');
 test('first login, direct URL guard, autosave, refresh, import and separated review',async({page})=>{
  await page.goto('/login');await page.getByLabel('Adres e-mail').fill(process.env.E2E_SETUP_EMAIL!);await page.getByLabel('Hasło',{exact:true}).fill(process.env.E2E_SETUP_PASSWORD!);await page.getByRole('button',{name:'Zaloguj się',exact:true}).click();
  await expect(page).toHaveURL(/welcome|setup/);
  await page.goto('/cv/new');await expect(page).toHaveURL(/welcome|setup/);
  if(page.url().includes('/welcome'))await page.getByRole('button',{name:/Mam już CV/}).click();
  await page.goto('/setup/1');await page.getByLabel('Imię',{exact:true}).fill('Alex');await page.getByLabel('Nazwisko',{exact:true}).fill('Morgan');await page.getByLabel('Docelowe stanowisko lub obszar').fill('Project Coordinator');
  await expect(page.getByRole('status')).toContainText('Zapisano na Twoim koncie.');await page.reload();await expect(page.getByLabel('Imię',{exact:true})).toHaveValue('Alex');
  await page.getByRole('button',{name:'Zapisz i przejdź dalej'}).click();await expect(page).toHaveURL(/setup\/2/);
  const doc=await Packer.toBuffer(new Document({sections:[{children:[new Paragraph('Alex Morgan'),new Paragraph('Project Coordinator at Fictional Harbor Labs, 2021-2024. Coordinated contractor schedules and project documentation. English B2.')]}]}));
  await page.getByLabel('PDF albo DOCX, do 5 MB').setInputFiles({name:`synthetic-${Date.now()}.docx`,mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:doc});
  await page.getByRole('button',{name:'Odczytaj moje CV',exact:true}).click();await expect(page.getByRole('status')).toContainText('Rozpoznano', {timeout:60000});await page.getByRole('button',{name:'Sprawdź rozpoznaną historię'}).click();
  await expect(page).toHaveURL(/setup\/3/);await expect(page.getByRole('button',{name:'Potwierdzam prawdziwość'}).first()).toBeVisible();
  const publication=page.getByRole('checkbox',{name:'Zgadzam się na użycie w CV'}).first();await expect(publication).not.toBeChecked();await page.getByRole('button',{name:'Potwierdzam prawdziwość'}).first().click();await expect(publication).not.toBeChecked();
  await page.reload();await expect(page).toHaveURL(/setup\/3/);
 });
});
