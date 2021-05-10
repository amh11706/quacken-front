import { JsonpClientBackend } from '@angular/common/http';
import { TokenizeResult } from '@angular/compiler/src/ml_parser/lexer';
import { EventEmitter } from '@angular/core';
import { Component, Input, OnInit, Output} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FileItem, FileUploader } from 'ng2-file-upload';
import { OutCmd } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';
import { SettingsComponent } from '../settings/settings.component';
import { MapEditor, DBTile, MapGroups } from '../map-editor.component';

const mapConversion: { [key: number]: number } = {
  0: 0, //empty
  1: 50, //Tall Rock
  2: 51, //Short Rock
  5: 5, //wind N
  4: 6, //wind E
  6: 7, //wind S
  3: 8, //wind W
  7: 10, //whirl NW
  8: 11, //whirl NE
  9: 9, //whirl SW
  10: 12, //whirl SE
  11: 21, //Flag1
  12: 22, //Flag2
  13: 23, //Flag3
};

@Component({
  selector: 'q-file-import',
  templateUrl: './file-import.component.html',
  styleUrls: ['./file-import.component.scss']
})
export class FileImportComponent implements OnInit {
  @Input() mapData : { [key: string]: DBTile[] } = {};
  @Input() showFileUpload : boolean = false;
  @Output() showFileUploadChange = new EventEmitter<boolean>();

  reader!: FileReader;
  uploader: FileUploader = new FileUploader({});
  mapErrors: string[] = [];

  constructor(private socket: WsService) {
  }

  ngOnInit(): void {
  }

  async process() {
    this.mapErrors = [];
    for (var i = 0; i < this.uploader.queue.length; i++) {
      let fileItem = this.uploader.queue[i]._file;
      if (fileItem.size > 10000) {
        alert("Each File should be less than 10 KB of size.");
        return;
      }
    }
    const result = await this.read(this.uploader.queue);
    for (let mapFile of result) {
      const map = {
        id: 0,
        name: mapFile.name.replace(".txt",""),
        released: true,
        data: this.convert(mapFile.data),
        description: "imported map",
        group: "cgmaps"
      }
       const prom = await this.socket.request(OutCmd.MapCreate, map);
       if(prom.error){
          this.mapErrors.push(prom.error); // do something with errors
       }else{
        if (this.mapData[prom.group]){
          this.mapData[prom.group].push(prom);
        }
      }
    }
    this.uploader.clearQueue();
  }

  convert(mapData: string){
    return  mapData.split("\n").slice(0,36).map(function(x){return x.split(",").map(v => mapConversion[+v])});
  }

  read(file_list: FileItem[]) {
    let promises: Promise<any>[] = [];
    for (let file of file_list) {
      const filePromise = new Promise(resolve => {
        let reader = new FileReader();
        reader.readAsText(file._file);
        reader.onload = () => resolve({
          name: file._file.name,
          data: reader.result
        });
      });
      promises.push(filePromise);
    }
    return Promise.all<{ name: string, data: string }>(promises);
  }

  close() {
    this.showFileUploadChange.emit(false);
    this.uploader.clearQueue();
  }
}
