import AdmZip from 'adm-zip';
import { Readable } from 'stream';
import csv from 'csv-parser';
import { BrowserWindow } from 'electron';
import { KAGGLE, FORM_URL } from './utils.js';

export async function fetchData(mainWindow: BrowserWindow) {
    let eventData: ProcessingEvent = { step: 0 };
    try {
        
        mainWindow.webContents.send('processing-event', eventData);
        var zipFile = await requestData();
        eventData.step = 1;

        mainWindow.webContents.send('processing-event', eventData);
        var rows = await processData(zipFile);
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

const submitResponseToForm = async (rows: Array<BabyData>, mainWindow: BrowserWindow) => {

    for (const row of rows) {
        const {
            YearOfBirth,
            Name,
            Number,
            Sex
        } = row;

        const res = await fetch(FORM_URL(YearOfBirth, Name, Sex, Number));

        mainWindow.webContents.send('submit-form', rows.indexOf(row) + 1);
    }
}

const requestData = async () => {
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

const processData = async (blob: Blob) => {

    var zip = new AdmZip(Buffer.from(await blob.arrayBuffer()));
    var zipEntries = zip.getEntries();
    var stream = Readable.from(zipEntries[0].getData());

    var processPromise = new Promise<Array<BabyData>>((resolve, reject) => {
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