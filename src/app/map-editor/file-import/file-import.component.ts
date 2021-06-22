import { EventEmitter, Component, Input, Output } from '@angular/core';

import { FileItem, FileUploader } from 'ng2-file-upload';
import { DBTile } from '../map-editor.component';
import { WsService } from '../../ws.service';
import { OutCmd } from '../../ws-messages';

const mapConversion: { [key: number]: number } = {
  0: 0, // empty
  1: 50, // Tall Rock
  2: 51, // Short Rock
  5: 5, // wind N
  4: 6, // wind E
  6: 7, // wind S
  3: 8, // wind W
  7: 10, // whirl NW
  8: 11, // whirl NE
  9: 9, // whirl SW
  10: 12, // whirl SE
  11: 21, // Flag1
  12: 22, // Flag2
  13: 23, // Flag3
};

@Component({
  selector: 'q-file-import',
  templateUrl: './file-import.component.html',
  styleUrls: ['./file-import.component.scss'],
})
export class FileImportComponent {
  @Input() mapData: { [key: string]: DBTile[] } = {};
  @Input() showFileUpload = false;
  @Output() showFileUploadChange = new EventEmitter<boolean>();

  reader!: FileReader;
  uploader: FileUploader = new FileUploader({});
  mapErrors: string[] = [];

  constructor(private socket: WsService) { }

  async process(): Promise<void> {
    this.mapErrors = [];
    for (let i = 0; i < this.uploader.queue.length; i++) {
      const fileItem = this.uploader.queue[i]._file;
      if (fileItem.size > 10000) {
        window.alert('Each File should be less than 10 KB of size.');
        return;
      }
    }
    const result = await this.read(this.uploader.queue);
    for (const mapFile of result) {
      const map = {
        id: 0,
        name: mapFile.name.replace('.txt', ''),
        released: true,
        data: this.convert(mapFile.data),
        description: 'imported map',
        group: 'cgmaps',
      };
      const prom = await this.socket.request(OutCmd.MapCreate, map);
      if (prom.error) {
        this.mapErrors.push(prom.error); // do something with errors
      } else {
        if (this.mapData[prom.group]) {
          this.mapData[prom.group].push(prom);
        }
      }
    }
    this.uploader.clearQueue();
  }

  convert(mapData: string): number[][] {
    const rows = mapData.split('\n').slice(0, 36).map(function(x) { return x.split(',').map(v => mapConversion[+v]); });
    while (rows.length > 36) rows.pop();
    return rows;
  }

  read(fileList: FileItem[]): Promise<{name: string, data: string}[]> {
    const promises: Promise<{name: string, data: string}>[] = [];
    for (const file of fileList) {
      const filePromise = new Promise<{name: string, data: string}>(resolve => {
        const reader = new FileReader();
        reader.readAsText(file._file);
        reader.onload = () => resolve({
          name: file._file.name,
          data: reader.result as string,
        });
      });
      promises.push(filePromise);
    }
    return Promise.all(promises);
  }

  close(): void {
    this.showFileUploadChange.emit(false);
    this.uploader.clearQueue();
  }

  clear(): void {
    this.uploader.clearQueue();
  }
}
