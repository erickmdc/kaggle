import { test, expect } from '@playwright/test';
import unzipper from 'unzipper';
import csv from 'csv-parser';

//TODO: Not working yet
test('get file from kaggle', async ({ page }) => {
  await page.goto('https://www.kaggle.com/');
  await page.getByRole('link', { name: 'Sign In' }).click();
  await page.getByRole('button', { name: 'Sign In with Email' }).click();
  await page.getByLabel('Email / Username').fill("emc.7@hotmail.com");
  await page.getByRole('textbox', { name: 'Password' }).fill("z@5vNdSKQjB3MSc");
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.goto('https://www.kaggle.com/datasets/thedevastator/us-baby-names-by-year-of-birth?select=babyNamesUSYOB-full.csv');

  await page.getByRole('button', { name: 'Download' }).nth(1).click();

  await page.getByRole('menuitem', { name: 'Download dataset as zip' }).click();

  page.on('download', async download => {
    const fileStream = await download.createReadStream();

    const processPromise = new Promise<Array<any>>((resolve, reject) => {
      let topResults: Array<any> = [];
      fileStream.pipe(unzipper.Parse());
      fileStream.pipe(csv());
      fileStream.take(500)
        .on('data', data => {
          topResults.push(data);
        })
        .on('end', () => resolve(topResults))
        .on('error', err => reject(err));
    });

    const results = await processPromise;
    expect(results.length).toBeGreaterThanOrEqual(499);
  });

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByText('Welcome, Erick Carvalho!')).toBeVisible();
});
