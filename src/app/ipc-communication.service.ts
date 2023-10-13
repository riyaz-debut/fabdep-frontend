import { Injectable } from "@angular/core";
import { IpcRenderer } from "electron";

@Injectable({
  providedIn: "root",
})
export class IpcCommunicationService {
  private ipc: IpcRenderer;

  constructor() {
    const self = this;
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require("electron").ipcRenderer;
      } catch (error) {
        throw error;
      }
    } else {
      console.warn("Could not load electron ipc");
    }
  }

  openUrlInElectron(url: string) {
    return new Promise<boolean>((resolve, reject) => {
      this.ipc.once("openUrlInElectron", (event, result) => {
        resolve(result);
      });
      this.ipc.send("openUrlInElectron", url);
      resolve(true);
    });
  }
}
