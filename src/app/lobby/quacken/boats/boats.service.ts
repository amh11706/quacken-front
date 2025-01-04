import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject, Subscription } from "rxjs";
import { Boat } from "./boat";
import { BoatSync, BoatTick, Clutter, MoveMessageIncoming, Sync } from "./types";
import { WsService } from "../../../ws/ws.service";
import { InCmd, Internal } from "../../../ws/ws-messages";
import { syncToBoat } from "./convert";
import { LobbyService } from "../../lobby.service";
import { CadeLobby } from "../../cadegoose/types";

@Injectable()
export class BoatsService {
  private boatMap = new Map<number, Boat>();
  private _boats = new BehaviorSubject<Boat[]>([]);
  get boats() { return this._boats.value; }
  boats$ = this._boats.asObservable();

  private clutter = new BehaviorSubject<Clutter[]>([]);
  clutter$ = this.clutter.asObservable();

  private myBoat = new BehaviorSubject<Boat>(new Boat(''));
  myBoat$ = this.myBoat.asObservable();
  private clickedBoat = new Subject<Boat>();
  clickedBoat$ = this.clickedBoat.asObservable();
  private _focusMyBoat = new Subject<void>();
  focusMyBoat$ = this._focusMyBoat.asObservable();

  private subs = new Subscription();

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
      if (l.boats) this.setBoats(Object.values(l.boats), true);
      if (l.clutter) this.clutter.next(l.clutter);
    }));
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  resetMymoves() {
    setTimeout(() => this.ws.dispatchMessage({ cmd: Internal.ResetMoves, data: undefined }));
  }

  resetBoats(): void {
    for (const boat of this.boats) boat.resetMoves();
  }

  focusMyBoat() {
    if (this.myBoat.value.isMe) this._focusMyBoat.next();
  }

  clickBoat(boat: Boat) {
    this.clickedBoat.next(boat);
  }

  setMyBoat(boat: Boat) {
    this.myBoat.value.isMe = false;
    boat.isMe = boat.id === this.ws.sId;
    this.myBoat.next(boat);
    this.focusMyBoat();
  }

  private handleTicks(ticks: Record<number, BoatTick>) {
    for (const boat of this._boats.value) {
      const tick = ticks[boat.id];
      if (!tick) continue;
      boat.damage = tick.d;
      boat.bilge = tick.b;
    }
  }

  private handleSync(s: Sync) {
    this.resetBoats();
    this.setBoats(s.sync);
    this.clutter.next(s.cSync);
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

  private updateMyBoat() {
    if (!this.ws.sId) return;
    const oldBoat = this.myBoat.value;
    oldBoat.isMe = false;
    const boat = this.boatMap.get(this.ws.sId) || new Boat('');
    boat.isMe = boat.id === this.ws.sId;
    this.myBoat.next(boat);
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