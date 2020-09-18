import { Component, OnInit, Input, OnDestroy } from '@angular/core';

import { WsService } from 'src/app/ws.service';
import { Lobby } from '../../lobby.component';
import { Subscription } from 'rxjs';
import { InCmd, OutCmd } from 'src/app/ws-messages';

interface Player {
  sId: number;
  name: string;
  slot: number;
  bid: number;
  tricks: number;
  ready: boolean;
}

export const spots = ['south', 'west', 'north', 'east'];

@Component({
  selector: 'q-spot',
  templateUrl: './spot.component.html',
  styleUrls: ['./spot.component.css']
})
export class SpotComponent implements OnInit, OnDestroy {
  private _lobby: Lobby = {} as Lobby;
  @Input() set lobby(l: Lobby) {
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
  get lobby() {
    return this._lobby;
  }

  rotatedSpots: Player[] = [];
  spotNames = spots;
  offerBlind = false;

  private sub = new Subscription();

  constructor(public ws: WsService) { }

  ngOnInit() {
    this.sub = this.ws.subscribe(InCmd.Cards, (c: number[]) => {
      for (const p of this.lobby.players) p.ready = false;
      if (c[0] >= 0) this.offerBlind = false;
    });

    this.sub.add(this.ws.subscribe(InCmd.Sit, (p: Player) => {
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
    this.sub.add(this.ws.subscribe(InCmd.Ready, (p: number) => this.lobby.players[p].ready = true));
    this.sub.add(this.ws.subscribe(InCmd.Take, (p: number) => this.lobby.players[p].tricks++));

    this.sub.add(this.ws.subscribe(InCmd.Bidding, (p: number) => {
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

  ngOnDestroy() {
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

  sit(spot: number) { this.ws.send(OutCmd.Sit, spot); }

  jump() { this.ws.send(OutCmd.Jump); }

  kick(spot: number) { this.ws.send(OutCmd.Kick, spot); }

  ready() { this.ws.send(OutCmd.Ready); }

  showCards() {
    this.offerBlind = false;
    this.ws.send(OutCmd.DeclineBlind);
  }

  bid(bid: number) {
    this.offerBlind = false;
    this.ws.send(OutCmd.Bid, bid);
  }

}
