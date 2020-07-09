import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
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
  moves: DBMove[] = [];
  newMove = {} as DBMove;

  constructor(private ws: WsService) { }

  ngOnInit(): void {
    this.sub.add(this.ws.connected$.subscribe(value => {
      if (value) this.ws.send('joinBnav');
    }));
    this.sub.add(this.ws.subscribe('positions', (m: DBMove[]) => {
      this.moves = m;
      this.setPercents();
    }));
    this.sub.add(this.ws.subscribe('addPosition', (m: DBMove) => {
      this.ws.dispatchMessage({ cmd: 'm', data: { type: 1, message: 'Moves submitted. Thank you!' } });
      if (m.position !== this.newMove.position) return;
      for (const move of this.moves) {
        if (move.moves === m.moves) {
          move.count++;
          return;
        }
        m.count = 1;
        this.moves.push(m);
        this.setPercents();
      }
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
    this.ws.send('positions', { position });
  }

  submitMoves() {
    this.ws.send('addPosition', this.newMove);
    this.newMove.moves = '';
    this.newMove.shots = '';
    this.newMove.notes = '';
  }

}
