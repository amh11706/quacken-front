import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { WsService } from 'src/app/ws.service';
import { Lobby } from '../../lobby.component';
import { Subscription } from 'rxjs';

interface Player {
  sId?: number,
  name?: string,
  slot?: number,
  bid?: number,
  tricks?: number,
  ready?: boolean,
}

export const spots = ['south', 'west', 'north', 'east'];

@Component({
  selector: 'app-spot',
  templateUrl: './spot.component.html',
  styleUrls: ['./spot.component.css']
})
export class SpotComponent implements OnInit, OnDestroy {
  private _lobby: Lobby = {} as Lobby;
  @Input() set lobby(l: Lobby) {
    this._lobby = l;
    l.sitting = -1;

    const newSpots = [{}, {}, {}, {}];
    this.rotatedSpots = [...newSpots];
    let mySpot = 0;
    for (const p of l.players) {
      if (!p) continue;
      Object.assign(newSpots[p.slot], p);
      if (p.sId === this.ws.sId) {
        l.sitting = p.slot;
        this.offerBlind = p.offerBlind;
        mySpot = p.slot;
      }
    }
    l.players = newSpots;
    this.rotateSpots(mySpot);
  }
  get lobby() {
    return this._lobby;
  }

  rotatedSpots: Player[] = [];
  spotNames = spots;
  offerBlind = false;

  private sub: Subscription;

  constructor(public ws: WsService) { }

  ngOnInit() {
    this.sub = this.ws.subscribe('cards', (c: number[]) => {
      for (const p of this.lobby.players) p.ready = false;
      if (c[0] >= 0) this.offerBlind = false;
    });

    this.sub.add(this.ws.subscribe('sit', (p: Player) => {
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
      for (const p of this.lobby.players) p.ready = false;
    }));

    this.sub.add(this.ws.subscribe('offerBlind', () => this.offerBlind = true));
    this.sub.add(this.ws.subscribe('ready', (p: number) => this.lobby.players[p].ready = true));
    this.sub.add(this.ws.subscribe('take', (p: number) => this.lobby.players[p].tricks++));

    this.sub.add(this.ws.subscribe('bidding', (p: number) => {
      const delay = this.lobby.played.length === 4 ? 1500 : 0;
      setTimeout(() => {
        this.lobby.playingP = 0;
        if (this.lobby.bidding === -1) for (const p of this.lobby.players) p.tricks = -1;
        this.lobby.bidding = p;
      }, delay);
    }));

    this.sub.add(this.ws.subscribe('over', () => {
      this.lobby.playingP = 0;
      this.lobby.playing = false;
      for (const p of this.lobby.players) p.tricks = -1;
    }));
  }

  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
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

  sit(spot: number) { this.ws.send('sit', spot); }

  jump() { this.ws.send('jump'); }

  kick(spot: number) { this.ws.send('kick', spot); }

  ready() { this.ws.send('ready'); }

  showCards() {
    this.offerBlind = false;
    this.ws.send('declineBlind');
  }

  bid(bid: number) {
    this.offerBlind = false;
    this.ws.send('bid', bid);
  }

}
