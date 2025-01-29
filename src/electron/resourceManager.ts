import AdmZip from 'adm-zip';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { BrowserWindow } from 'electron';
import { KAGGLE, FORM_URL } from './utils.js';

// Main method
export async function fetchData(mainWindow: BrowserWindow): Promise<void> {
  let eventData: ProcessingEvent = { step: 0 };
  try {

    mainWindow.webContents.send('processing-event', eventData);
    const zipFile = await requestData();
    eventData.step = 1;

    mainWindow.webContents.send('processing-event', eventData);
    const rows = await processData(zipFile);
    eventData.step = 2;

    mainWindow.webContents.send('processing-event', eventData);
    await submitResponseToForm(rows, mainWindow);
    eventData.step = 3;

    mainWindow.webContents.send('processing-event', eventData);

  } catch (error: any) {
    console.log(error);
    eventData.step = 99;
    eventData.message = error.message ? error.message as string : 'Unexpected error. See log for details.';
    mainWindow.webContents.send('processing-event', eventData);
  }
}

//Submits data to Google Form and shows progress by sending an event
const submitResponseToForm = async (rows: Array<BabyData>, mainWindow: BrowserWindow): Promise<void> => {

  //Doing this synchronously so Form doesn't get overloaded
  for (const row of rows) {
    const {
      YearOfBirth,
      Name,
      Number,
      Sex
    } = row;

    await fetch(FORM_URL(YearOfBirth, Name, Sex, Number));

    mainWindow.webContents.send('submit-form', rows.indexOf(row) + 1);
  }
}

//Fetch kaggle dataset and returns a Blob
const requestData = async (): Promise<Blob> => {
  const response = await fetch(
    KAGGLE.url, {
    method: 'GET',
    headers: new Headers({
      'Authorization': 'Basic ' + btoa(KAGGLE.auth),
      'Content-Type': 'application/x-www-form-urlencoded'
    })
  });

  return await response.blob();
}

//Gets a zip file with one csv document as Blob and returns an array of BabyData
const processData = async (blob: Blob): Promise<Array<BabyData>> => {

  const zip = new AdmZip(Buffer.from(await blob.arrayBuffer()));
  const zipEntries = zip.getEntries();
  const stream = Readable.from(zipEntries[0].getData());

  const processPromise = new Promise<Array<BabyData>>((resolve, reject) => {
    let topResults: Array<BabyData> = [];
    stream
      .pipe(csv())
      .take(500)
      .on('data', (data: BabyData) => {
        topResults.push(data);
      })
      .on('end', () => resolve(topResults))
      .on('error', err => reject(err));
  });

  return await processPromise;
}