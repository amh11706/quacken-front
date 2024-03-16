import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { WsService } from '../../../ws/ws.service';
import { Internal, OutCmd } from '../../../ws/ws-messages';
import { SettingsService } from '../../settings.service';
import { EscMenuService } from '../../../esc-menu/esc-menu.service';
import { MapOption } from './types';

@Component({
  selector: 'q-map-card',
  templateUrl: './map-card.component.html',
  styleUrls: ['./map-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapCardComponent {
  @Input() map?: MapOption;
  @Input() width = 20;
  @Input() height = 36;
  @Input() safeZone = true;
  @Input() disabled = false;
  @Input() seeds = [] as string[];

  @Output() selectedMap = new EventEmitter<number>();
  generated = 'Generated';

  constructor(public ss: SettingsService, public ws: WsService, private es: EscMenuService) { }

  selectMap(id: number): void {
    this.selectedMap.emit(id);
  }

  updateSeed(seed: string): void {
    this.ws.send(OutCmd.ChatCommand, '/seed ' + seed);
  }

  openAdvanced(): void {
    this.ws.dispatchMessage({ cmd: Internal.OpenAdvanced, data: undefined });
    void this.es.openMenu(false);
  }
}
