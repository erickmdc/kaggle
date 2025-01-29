import electron from "electron";

electron.contextBridge.exposeInMainWorld("electron", {
  fetchData: () => electron.ipcRenderer.invoke('fetchData'),
  subscribeRequestStatus: (callback: (eventData: ProcessingEvent) => void) => {
    electron.ipcRenderer.on('processing-event', (_, data) => {
      callback(data);
    })
  },
  subscribeSubmitFormStatus: (callback: (eventData: number) => void) => {
    electron.ipcRenderer.on('submit-form', (_, data) => {
      callback(data);
    })
  },
});