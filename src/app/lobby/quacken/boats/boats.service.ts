import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';

import { Boat } from './boat';
import { BoatSync, BoatTick, Clutter, MoveMessageIncoming, Sync } from './types';
import { WsService } from '../../../ws/ws.service';
import { InCmd, Internal } from '../../../ws/ws-messages';
import { syncToBoat } from './convert';
import { LobbyService } from '../../lobby.service';
import { CadeLobby } from '../../cadegoose/types';

@Injectable()
export class BoatsService implements OnDestroy {
  private boatMap = new Map<number, Boat>();
  private _boats = new BehaviorSubject<Boat[]>([]);
  get boats() { return this._boats.value; }
  boats$ = this._boats.asObservable();

  private clutter = new Subject<Clutter[]>();
  clutter$ = this.clutter.asObservable();

  private myBoat = new Subject<Boat>();
  myBoat$ = this.myBoat.asObservable();
  private clickedBoat = new Subject<Boat>();
  clickedBoat$ = this.clickedBoat.asObservable();
  private _focusMyBoat = new Subject<void>();
  focusMyBoat$ = this._focusMyBoat.asObservable();

  private subs = new Subscription();
  private lobbyId?: number;

  constructor(private ws: WsService, private lobby: LobbyService<CadeLobby>) {
    this.initSubs();
  }

  private initSubs() {
    this.subs.add(this.ws.subscribe(InCmd.NewBoat, boat => this.setBoats(Array.isArray(boat) ? boat : [boat], false)));
    this.subs.add(this.ws.subscribe(InCmd.DelBoat, id => this.deleteBoat(id)));
    this.subs.add(this.ws.subscribe(InCmd.Moves, s => this.handleMoves(Array.isArray(s) ? s : [s])));
    this.subs.add(this.ws.subscribe(InCmd.Ready, m => this.handleReady(m)));
    this.subs.add(this.ws.subscribe(InCmd.Sync, s => this.handleSync(s)));
    this.subs.add(this.ws.subscribe(InCmd.BoatTicks, ticks => this.handleTicks(ticks)));
    this.subs.add(this.lobby.get().subscribe(l => {
      if (l.id !== this.lobbyId) {
        this.lobbyId = l.id;
        this.boatMap.clear();
        this.myBoat.next(new Boat(''));
      }
      if (l.sync) void this.handleSync(l.sync);
    }));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  resetMymoves() {
    setTimeout(() => this.ws.dispatchMessage({ cmd: Internal.ResetMoves, data: undefined }));
  }

  refreshBoats() {
    this._boats.next(this.boats);
  }

  resetBoats(): void {
    for (const boat of this.boats) boat.resetMoves();
  }

  focusMyBoat() {
    this._focusMyBoat.next();
  }

  clickBoat(boat: Boat) {
    this.clickedBoat.next(boat);
  }

  setMyBoat(boat: Boat, focus = true) {
    this.myBoat.next(boat);
    if (focus) this.focusMyBoat();
  }

  private handleTicks(ticks: Record<number, BoatTick>) {
    for (const boat of this._boats.value) {
      const tick = ticks[boat.id];
      if (!tick) continue;
      boat.damage = tick.d;
      boat.bilge = tick.b;
    }
  }

  private async handleSync(s: Sync) {
    // delay to make sure the turn service handles the sync first
    await new Promise(resolve => setTimeout(resolve));
    this.setBoats(s.sync);
    this.clutter.next(s.cSync);
    this.resetBoats();
    this.handleMoves(s.moves || []);
  }

  private handleReady(m: { id: number, ready: boolean }) {
    const boat = this.boatMap.get(m.id);
    if (boat) boat.ready = m.ready;
  }

  private handleMoves(s: MoveMessageIncoming[]) {
    for (const move of s) {
      const boat = this.boatMap.get(move.t);
      if (!boat) continue;
      boat.moves = move.m;
      if (move.s) boat.shots = move.s;
    }
  }

  private deleteBoat(id: number) {
    this.boatMap.delete(id);
    this.updateMyBoat();
    this._boats.next([...this.boatMap.values()]);
  }

  private myLastBoat?: Boat;

  private updateMyBoat() {
    if (!this.ws.sId) return;
    const boat = this.boatMap.get(this.ws.sId);
    if (!boat) return;
    if (boat === this.myLastBoat) return;
    if (this.myLastBoat) this.myLastBoat.isMe = false;
    this.myBoat.next(boat);
    this.myLastBoat = boat;
  }

  private setBoats(boats: BoatSync[], reset = true) {
    const newBoats = new Map<number, Boat>();
    if (!reset) {
      for (const boat of this._boats.value) newBoats.set(boat.id, boat);
    }
    for (const sBoat of boats) {
      const boat = this.boatMap.get(sBoat.id) ||
        new Boat(sBoat.n, sBoat.ty, sBoat.id === this.ws.sId);
      syncToBoat(boat, sBoat);
      newBoats.set(boat.id, boat);
    }

    this.boatMap = newBoats;
    this.updateMyBoat();
    this._boats.next([...newBoats.values()]);
  }
}
