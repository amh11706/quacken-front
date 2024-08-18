import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { WsService } from '../../../ws/ws.service';
import { InCmd, OutCmd } from '../../../ws/ws-messages';
import { Lobby } from '../../cadegoose/types';
import { Player } from '../types';

export const spots = ['south', 'west', 'north', 'east'];

export type SpadeLobby = Lobby & {
  sitting: number;
  played: any[];
  lastTrick: any[];
  playingP: number;
  bidding: number;
  playTo: number;
  spadeBroke: boolean;
 };

@Component({
  selector: 'q-spot',
  templateUrl: './spot.component.html',
  styleUrls: ['./spot.component.css'],
})
export class SpotComponent implements OnInit, OnDestroy {
  private _lobby = {} as SpadeLobby;
  @Input() set lobby(l: SpadeLobby) {
    this._lobby = l;
    l.sitting = -1;

    let mySpot = 0;
    this.rotatedSpots = [];
    for (let p of l.players) {
      if (!p) p = {};
      if (p.sId === this.ws.sId) {
        l.sitting = p.slot;
        this.offerBlind = p.offerBlind;
        mySpot = p.slot;
      }
      this.rotatedSpots.push(p);
    }
    l.players = [...this.rotatedSpots];
    this.rotateSpots(mySpot);
  }

  get lobby(): SpadeLobby {
    return this._lobby;
  }

  rotatedSpots: Player[] = [];
  spotNames = spots;
  offerBlind = false;

  private sub = new Subscription();

  constructor(public ws: WsService) { }

  ngOnInit(): void {
    this.sub.add(this.ws.subscribe(InCmd.Cards, c => {
      for (const p of this.lobby.players) p.ready = false;
      const card = c[0];
      if (card && card >= 0) this.offerBlind = false;
    }));

    this.sub.add(this.ws.subscribe(InCmd.Sit, p => {
      Object.assign(this.lobby.players[p.slot], p);
      if (p.sId === this.ws.sId) {
        this.lobby.sitting = p.slot;
        this.rotateSpots(p.slot);
      } else if (p.slot === this.lobby.sitting) {
        for (const c of this.lobby.played) {
          c.position = spots[(spots.indexOf(c.position) + this.lobby.sitting) % 4];
        }
        for (const c of this.lobby.lastTrick) {
          c.position = spots[(spots.indexOf(c.position) + this.lobby.sitting) % 4];
        }
        this.lobby.sitting = -1;
        this.rotatedSpots = [...this.lobby.players];
      }
      for (const player of this.lobby.players) player.ready = false;
    }));

    this.sub.add(this.ws.subscribe(InCmd.OfferBlind, () => this.offerBlind = true));
    this.sub.add(this.ws.subscribe(InCmd.Ready, p => this.lobby.players[+p].ready = true));
    this.sub.add(this.ws.subscribe(InCmd.Take, p => this.lobby.players[p].tricks++));

    this.sub.add(this.ws.subscribe(InCmd.Bidding, p => {
      const delay = this.lobby.played.length === 4 ? 1500 : 0;
      setTimeout(() => {
        this.lobby.playingP = 0;
        if (this.lobby.bidding === -1) for (const player of this.lobby.players) player.tricks = -1;
        this.lobby.bidding = p;
      }, delay);
    }));

    this.sub.add(this.ws.subscribe(InCmd.Over, () => {
      this.lobby.playingP = 0;
      this.lobby.playing = false;
      for (const p of this.lobby.players) p.tricks = -1;
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private rotateSpots(start: number) {
    for (let i = 0; i < 4; i++) {
      this.rotatedSpots[i] = this.lobby.players[start];
      start = (start + 1) % 4;
    }
    for (const c of this.lobby.played) {
      c.position = spots[(spots.indexOf(c.position) + 4 - start) % 4];
    }
    for (const c of this.lobby.lastTrick) {
      c.position = spots[(spots.indexOf(c.position) + 4 - start) % 4];
    }
  }

  sit(spot: number): void { this.ws.send(OutCmd.Sit, spot); }

  jump(): void { this.ws.send(OutCmd.Jump); }

  kick(spot: number): void { this.ws.send(OutCmd.Kick, spot); }

  ready(): void { this.ws.send(OutCmd.Ready, undefined); }

  showCards(): void {
    this.offerBlind = false;
    this.ws.send(OutCmd.DeclineBlind);
  }

  bid(bid: number): void {
    this.offerBlind = false;
    this.ws.send(OutCmd.Bid, bid);
  }
}
