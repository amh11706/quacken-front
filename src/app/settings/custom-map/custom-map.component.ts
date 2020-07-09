import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { SettingMap } from '../settings.service';
import { WsService } from 'src/app/ws.service';

@Component({
  selector: 'q-custom-map',
  templateUrl: './custom-map.component.html',
  styleUrls: ['./custom-map.component.css']
})
export class CustomMapComponent implements OnInit, OnDestroy {
  @Input() group?: SettingMap;
  @Input() setting: any = {};
  @Input() disabled?: boolean;
  @Output() save = new EventEmitter();

  data = [];
  loading = true;

  private sub = new Subscription();

  constructor(private ws: WsService) { }

  ngOnInit() {
    this.ws.send(this.setting.cmd);
    this.sub = this.ws.subscribe(this.setting.cmd, m => {
      for (const i of m) i.label = i.name + ' (' + i.username + ')';
      this.data = m;
      this.loading = false;
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

}
