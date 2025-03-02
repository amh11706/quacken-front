import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnDestroy, Injector } from '@angular/core';

import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { WsService } from '../../ws/ws.service';
import { AdvancedComponent } from '../advanced/advanced.component';
import { SettingsService } from '../settings.service';

import { SettingInput, SettingName, Settings } from './settings';
import { Setting } from '../types';

export const links: Record<number, string> = {
  14: 'smsloop/smsloop',
  15: 'lgsloop/lgsloop',
  16: 'dhow/dhow',
  17: 'fanchuan/fanchuan',
  18: 'longship/longship',
  19: 'baghlah/baghlah',
  20: 'merchbrig/merchbrig',
  21: 'junk/junk',
  22: 'warbrig/warbrig',
  23: 'merchgal/merchgal',
  24: 'xebec/xebec',
  25: 'wargal/wargal',
  26: 'warfrig/warfrig',
  27: 'grandfrig/grandfrig',
  28: 'blackship/blackship',
};

export function getShipLink(id: number): string {
  return `/assets/boats/${links[id] || 'boat' + id}.png`;
}

@Component({
    selector: 'q-setting',
    templateUrl: './setting.component.html',
    styleUrls: ['./setting.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class SettingComponent implements OnDestroy {
  @Input() disabled = false;
  @Input() set name(value: SettingName) {
    this.setting = Settings[value] || {};
    void this.fetch();
  }

  @Output() valueChange = new EventEmitter<number>();
  private sub = new Subscription();

  setting = {} as SettingInput;
  settingValue = {} as Setting;
  getShipLink = getShipLink;

  constructor(
    public ss: SettingsService,
    private ws: WsService,
    private dialog: MatDialog,
    private injector: Injector,
  ) { }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private fetch() {
    if (!this.setting.name) return;
    this.settingValue = this.ss.prefetch(this.setting.group)[this.setting.name];
    this.sub.add(this.settingValue.userStream.subscribe(value => {
      this.valueChange.emit(value);
    }));
    void this.ss.getGroup(this.setting.group);
  }

  openAdvanced(): void {
    const copy = this.settingValue.clone();
    this.dialog.open(AdvancedComponent, {
      injector: this.injector,
      data: {
        component: this.setting.advancedComponent,
        setting: copy,
        admin: this.setting.admin,
      },
    }).afterClosed().subscribe((value: string) => {
      if (value !== 'true') return;
      // only assign the value if the user clicked save.
      this.settingValue.data = copy.data;
      this.settingValue.value = copy.value;
    });
  }

  send(): void {
    if (this.setting.type !== 'button') return;
    if (!this.setting.trigger) return;
    this.ws.send(this.setting.trigger, this.setting.data);
  }

  save(value: number): void {
    this.settingValue.value = value;

    if (this.setting.trigger) {
      this.ws.send(this.setting.trigger, +this.settingValue.value);
    }
  }
}
