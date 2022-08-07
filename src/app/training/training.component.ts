import { Component, ViewChild } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Tokens } from '../boats/move-input/move-input.component';
import { CadeKeyActions, CadeMoveKeys } from '../lobby/cadegoose/hud/hud.component';
import { TwodRenderComponent } from '../lobby/cadegoose/twod-render/twod-render.component';
import { Boat } from '../lobby/quacken/boats/boat';
import { ReplayComponent } from '../replay/replay.component';
import { InCmd } from '../ws-messages';
import { InMessage } from '../ws.service';

@Component({
  selector: 'q-training',
  templateUrl: './training.component.html',
  styleUrls: ['./training.component.scss'],
})
export class TrainingComponent extends ReplayComponent {
  @ViewChild('renderer', { static: false }) renderer?: TwodRenderComponent;
  actions = CadeKeyActions;
  moveKeys = CadeMoveKeys;
  kbControls = 1;
  graphicSettings = {
    mapScale: { value: 50 },
    speed: { value: 10 },
    water: { value: 1 },
    showFps: { value: 0 },
    renderMode: { value: -1 },
  };

  mapHeight = 36;
  mapWidth = 20;
  private map: number[][] = [];
  seconds$ = new BehaviorSubject<number>(76);
  resetMoves$ = new Subject<void>();

  myBoat = new Boat('');
  dragContext = { source: 8, move: 0 };
  localBoat = {
    moves: [0, 0, 0, 0],
    shots: [0, 0, 0, 0, 0, 0, 0, 0],
  };

  totalTokens: Tokens = {
    moves: [5, 5, 5],
    shots: 0,
    maneuvers: [0, 0, 0, 0],
  };

  unusedTokens: Tokens = {
    moves: [0, 0, 0],
    shots: 0,
    maneuvers: [0, 0, 0, 0],
  };

  sendMoves(): void {
    //
  }

  imReady(): void {
    //
  }

  protected checkMessage(m: InMessage): void {
    super.checkMessage(m);
    switch (m.cmd) {
      case InCmd.LobbyJoin:
        this.setMapB64(m.data.map);
        this.renderer?.fillMap(this.map, m.data.flags);
        break;
      default:
    }
  }

  protected initMap(): void {
    for (let y = 0; y < this.mapHeight; y++) {
      const row = [];
      for (let x = 0; x < this.mapWidth; x++) {
        row.push(0);
      }
      this.map.push(row);
    }
  }

  protected setMapB64(map: string): void {
    if (!this.map.length) this.initMap();
    const bString = window.atob(map);
    let i = 0;
    for (let y = 0; y < this.mapHeight; y++) {
      const row = this.map[y];
      if (!row) break;
      for (let x = 0; x < this.mapWidth; x++) {
        row[x] = bString.charCodeAt(i);
        i++;
      }
    }
  }
}
