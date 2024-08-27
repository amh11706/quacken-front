import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ChatModule } from '../../../chat/chat.module';
import { EscMenuService } from '../../../esc-menu/esc-menu.service';
import { AiRender } from '../../../replay/cadegoose/ai-render';
import { WsService } from '../../../ws/ws.service';
import { Points } from '../../../replay/cadegoose/types';

interface TileInfo {
  spawn: number;
  flags: number;
  coverMoves: number;
}

export interface MapInfo {
  spawnRating: number;
  hotspotRating: number;
  maneuverabilityRating: number;
  tiles: Record<string, TileInfo>;
}

@Component({
  selector: 'q-mapinfo-hud',
  standalone: true,
  imports: [CommonModule, ChatModule, MatButtonToggleModule],
  templateUrl: './mapinfo-hud.component.html',
  styleUrl: './mapinfo-hud.component.scss',
})
export class MapinfoHudComponent implements OnChanges {
  @Input() mapInfo = {} as MapInfo;
  selectedOverlay = ['spawn', 'flags'];

  private aiRender = new AiRender(this.ws, 20, 36);

  constructor(
    public es: EscMenuService,
    private ws: WsService,
  ) {}

  ngOnChanges() {
    setTimeout(() => {
      this.setOverlay(this.selectedOverlay);
      this.aiRender.setBoat({ pm: this.mapInfo.tiles } as any);
    });
  }

  setOverlay(overlay: string[]) {
    this.aiRender.setMetric(overlay as (keyof Points)[]);
  }
}
