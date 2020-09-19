import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { InCmd, OutCmd } from '../ws-messages';
import { WsService } from '../ws.service';

interface DBMove {
  count: number;
  position?: string;
  moves: string;
  shots?: string;
  shipType?: string;
  notes?: string;
  percent?: string;
}

@Component({
  selector: 'q-bnav',
  templateUrl: './bnav.component.html',
  styleUrls: ['./bnav.component.scss']
})
export class BnavComponent implements OnInit, OnDestroy {
  private sub = new Subscription();
  private debounce?: number;
  moves: DBMove[] = [];
  newMove = {} as DBMove;

  constructor(private ws: WsService) { }

  ngOnInit(): void {
    this.sub.add(this.ws.connected$.subscribe(() => {
      this.ws.send(OutCmd.BnavJoin);
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  setPercents() {
    let total = 0;
    for (const move of this.moves) total += move.count;
    for (const move of this.moves) move.percent = Math.round(move.count / total * 1000) / 10 + '%';
  }

  positionChange(position: string) {
    this.newMove.position = position;
    this.moves = [];
    clearTimeout(this.debounce);
    this.debounce = setTimeout(() => this.ws.request(OutCmd.BnavGetPositions, { position }).then((m: DBMove[]) => {
      this.moves = m;
      this.setPercents();
    }), 500);
  }

  submitMoves() {
    this.ws.request(OutCmd.BnavSavePosition, this.newMove).then((m: DBMove) => {
      this.ws.dispatchMessage({ cmd: InCmd.ChatMessage, data: { type: 1, message: 'Moves submitted. Thank you!' } });
      if (m.position !== this.newMove.position) return;
      for (const move of this.moves) {
        if (move.moves === m.moves) {
          move.count++;
          this.setPercents();
          return;
        }
      }
      m.count = 1;
      this.moves.push(m);
      this.setPercents();
    });
    this.newMove.moves = '';
    this.newMove.shots = '';
    this.newMove.notes = '';
  }

}
