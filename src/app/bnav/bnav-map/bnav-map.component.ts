import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { BoatSync } from 'src/app/lobby/quacken/boats/boats.component';
import { WsService } from 'src/app/ws.service';
import { Subscription } from 'rxjs';
import { Internal } from 'src/app/ws-messages';

@Component({
  selector: 'q-bnav-map',
  templateUrl: './bnav-map.component.html',
  styleUrls: ['./bnav-map.component.scss']
})
export class BnavMapComponent implements OnInit, OnDestroy {
  @Output() positionChange = new EventEmitter<string>();
  rows: number[] = [];
  columns: number[] = [];
  private clickX = 0;
  private clickY = 0;

  private ourBoat: BoatSync = {
    x: 5, y: 5, f: 0,
    n: 'Our Boat', id: 1, t: 0, b: 0, tp: 0, ty: 0, ml: 0, ms: 4, mDamage: 1, mMoves: 3, inSq: 0,
  };
  private theirBoat: BoatSync = {
    x: 3, y: 5, f: 1,
    n: 'Their Boat', id: 0, t: 0, b: 0, tp: 0, ty: 2, ml: 0, ms: 4, mDamage: 1, mMoves: 3, inSq: 0,
  };
  private boats = { us: this.ourBoat, them: this.theirBoat };
  private sub = new Subscription();

  constructor(private ws: WsService) { }

  ngOnInit(): void {
    for (let x = 0; x < 11; x++) this.columns.push(x);
    for (let y = 0; y < 11; y++) this.rows.push(y);

    this.sub.add(this.ws.connected$.subscribe(() => {
      this.ourBoat.id = this.ws.sId || 1;
      setTimeout(this.updateBoats);
    }));
    this.sub.add(this.ws.subscribe(Internal.MyBoat, () => null));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  private updateBoats = () => {
    this.ws.dispatchMessage({ cmd: Internal.Boats, data: { boats: this.boats } });
    const b = this.theirBoat;
    const ob = this.ourBoat;
    const relativeFace = (b.f - ob.f + 4) % 4;
    let relativeX = b.x - ob.y, relativeY = b.y - ob.y;
    if (ob.f % 2) [relativeX, relativeY] = [relativeY, relativeX];
    if (ob.f > 1) [relativeX, relativeY] = [-relativeX, -relativeY];

    this.positionChange.emit(`${relativeX},${relativeY},${relativeFace}`);
  }

  clickTile(x: number, y: number) {
    const b = this.theirBoat;
    if (x === 5 && y === 5) {
      this.ourBoat.f = (this.ourBoat.f + 1) % 4;
    } else if (x === b.x && y === b.y) {
      b.f = (b.f + 1) % 4;
    } else {
      b.x = x;
      b.y = y;
    }

    this.updateBoats();
  }

  mouseDown(e: MouseEvent) {
    this.clickX = e.clientX;
    this.clickY = e.clientY;
  }

  mouseUp(e: MouseEvent, x: number, y: number) {
    if (Math.abs(e.clientX - this.clickX) + Math.abs(e.clientY - this.clickY) > 20) return;
    this.clickTile(x, y);
  }

}
