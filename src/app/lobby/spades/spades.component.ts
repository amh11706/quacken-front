import { Component, OnInit, Input, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

import { SettingsService } from '../../settings/settings.service';
import { FriendsService } from '../../chat/friends/friends.service';
import { WsService } from '../../ws/ws.service';
import { Settings } from '../../settings/setting/settings';
import { InCmd, OutCmd } from '../../ws/ws-messages';
import { EscMenuService } from '../../esc-menu/esc-menu.service';
import { TimerComponent } from './timer/timer.component';
import { spots } from './spot/spot.component';
import { Card } from './card/card.component';
import { SettingMap } from '../../settings/types';
import { Lobby } from '../cadegoose/types';

const ownerSettings: (keyof typeof Settings)[] = [
  'watchers', 'turnTime', 'playTo',
];

@Component({
  selector: 'q-spades',
  templateUrl: './spades.component.html',
  styleUrls: ['./spades.component.css'],
})
export class SpadesComponent implements OnInit, OnDestroy {
  @ViewChild(TimerComponent, { static: false }) timer?: TimerComponent;
  private _lobby: Lobby = { id: 0, owner: false, type: 'Spades', players: [{}, {}, {}, {}] };
  @Input() set lobby(l: Lobby) {
    if (!l) return;
    if (!l.played) l.played = [];
    if (!l.lastTrick) l.lastTrick = [];
    this._lobby = l;
    this.cards = [];
    this.select = 1;
    this.selected = [];
    this.played = false;

    let newPlayed = [];
    for (const p of l.played) {
      const c = this.getCard(p.id);
      const sitting = this.lobby.sitting > -1 ? this.lobby.sitting : 0;
      c.position = spots[(4 + p.position - sitting) % 4];
      newPlayed.push(c);
    }
    l.played = newPlayed;

    newPlayed = [];
    for (const p of l.lastTrick) {
      const c = this.getCard(p.id);
      const sitting = this.lobby.sitting > -1 ? this.lobby.sitting : 0;
      c.position = spots[(4 + p.position - sitting) % 4];
      newPlayed.push(c);
    }
    l.lastTrick = newPlayed;
  }

  get lobby(): Lobby {
    return this._lobby;
  }

  settings: SettingMap = {};

  cards: Card[] = [];
  private select = 1;
  selected: Card[] = [];

  private sub = new Subscription();
  private played = false;

  constructor(
    private ss: SettingsService,
    private fs: FriendsService,
    public ws: WsService,
    public es: EscMenuService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.es.setLobby(1);
    this.ss.setLobbySettings(ownerSettings);

    this.sub.add(this.ws.subscribe(InCmd.Cards, c => {
      if (!(this.lobby.played.length === 4)) this.setCards(c);
      else setTimeout(() => this.setCards(c), 2000);
      this.lobby.playing = true;
      this.select = 1;
      this.selected = [];
    }));

    this.sub.add(this.ws.subscribe(InCmd.PlayTo, p => {
      this.lobby.playTo = p;
    }));

    this.sub.add(this.ws.subscribe(InCmd.Bidding, () => {
      this.timer?.go((this.settings.turnTime?.value || 10) * 2);
      this.lobby.playing = true;
    }));

    this.sub.add(this.ws.subscribe(InCmd.Playing, p => {
      this.timer?.go(this.settings.turnTime?.value);
      this.lobby.bidding = 0;
      this.lobby.playingP = p.id;
      this.select = p.quantity;
      if (p.quantity > 1 && this.ws.sId === p.id) {
        for (const c of this.cards) c.valid = true;
        return;
      }

      this.checkValid();
      if (this.ws.sId === p.id) {
        if (this.cards.length === 1) {
          const delay = this.lobby.played.length === 4 ? 1500 : 500;
          setTimeout(() => {
            if (this.cards.length === 1) this.play(this.cards);
          }, delay);
        } else if (this.selected.length) this.play(this.selected);
      }
    }));

    this.sub.add(this.ws.subscribe(InCmd.Card, p => {
      const c = this.getCard(p.id);
      const sitting = this.lobby.sitting > -1 ? this.lobby.sitting : 0;
      c.position = spots[(4 + p.position - sitting) % 4];
      this.lobby.played.push(c);

      if (p.id < 13) this.lobby.spadeBroke = true;
      if (this.lobby.playingP === this.ws.sId) {
        this.played = true;
        this.selected = [];
        this.cards = this.cards.filter(card => {
          card.valid = false;
          return card.id !== p.id;
        });
      }
    }));

    this.sub.add(this.ws.subscribe(InCmd.Take, (p: number) => {
      this.played = false;
      setTimeout(() => {
        const sitting = this.lobby.sitting > -1 ? this.lobby.sitting : 0;
        this.lobby.lastTrick = [];
        const wonSpot = spots[(4 + p - sitting) % 4];
        for (const c of this.lobby.played) {
          if (this.lobby.lastTrick.length === 4) break;
          if (c.position === wonSpot) c.won = true;
          this.lobby.lastTrick.push({ ...c });
          c.position = spots[(4 + p - sitting) % 4];
        }
        setTimeout(() => {
          this.lobby.played = this.lobby.played.slice(4);
          this.checkValid();
        }, 500);
      }, 1000);
    }));

    this.sub.add(this.ws.subscribe(InCmd.Scores, p => {
      this.lobby.scores = p;
      this.lobby.spadeBroke = false;
      for (const player of this.lobby.players) {
        player.tricks = -1;
        player.bid = 0;
      }
    }));

    this.settings = await this.ss.getGroup('l/spades', true);
    if (this.lobby.playing) this.timer?.go(this.settings.turnTime?.value);
    const me = this.lobby.players[this.lobby.sitting];
    if (me && me.offerBlind) this.select = 2;
  }

  ngOnDestroy(): void {
    this.es.setLobby();
    this.sub.unsubscribe();

    this.ss.setLobbySettings([]);
    this.fs.allowInvite = false;
    this.ss.admin = true;
  }

  timeUp(): void {
    if (this.lobby.playingP === this.ws.sId) {
      let valid: Card[] = [];
      for (const c of this.cards) if (c.valid) valid.push(c);

      const play = [];
      for (let i = 0; i < this.select; i++) {
        const card = valid[Math.round(Math.random() * (valid.length - 1))];
        if (!card) continue;
        play.push(card);
        valid = valid.filter(c => c !== card);
      }
      this.play(play);
    } else if (this.lobby.bidding === this.ws.sId) {
      this.ws.send(OutCmd.Bid, 3);
    }
  }

  play(cards?: Card[]): void {
    if (!cards) return;
    const m = cards.map(c => c.id);
    this.ws.send(OutCmd.Card, m);
    this.select = 1;
  }

  private highlightPass(s: Card[]) {
    const pass: Card[] = [];
    // eslint-disable-next-line no-labels
    search:
    for (const c of s) {
      // eslint-disable-next-line no-labels
      for (const card of this.cards) if (card.id === c.id) continue search;
      c.selected = true;
      pass.push(c);
    }

    setTimeout(() => {
      for (const c of pass) c.selected = false;
    }, 1000);
  }

  private setCards(cards: number[]) {
    cards.sort((a, b) => a - b);
    const newCards = cards.map(c => {
      return this.getCard(c);
    });
    if (this.cards.length && this.cards.length < cards.length) this.highlightPass(newCards);
    this.cards = newCards;
    this.checkValid();
  }

  private getCard(id: number): Card {
    if (id < 0) return { id, suit: 4, value: 2 };
    return {
      id,
      suit: 3 - Math.floor(id / 13),
      value: (id + 1) % 13,
    };
  }

  private checkValid() {
    const length = this.lobby.played.length % 4;
    if (this.played || this.lobby.playingP === 0 ||
      (length === 0 && this.lobby.playingP !== this.ws.sId)) {
      for (const card of this.cards) card.valid = false;
      this.selected = [];
      return;
    }

    const free = !length;
    let validSuits = [free, free, free, this.lobby.spadeBroke && free];
    if (!free) {
      let suit = this.lobby.played[0].suit;
      if (this.lobby.played.length > 4) suit = this.lobby.played[4];
      let hasSuit = false;
      for (const card of this.cards) {
        if (card.suit === suit) {
          hasSuit = true;
          break;
        }
      }

      if (hasSuit) validSuits[suit] = true;
      else validSuits = [true, true, true, true];
    }

    let validCards = 0;
    for (const card of this.cards) {
      card.valid = validSuits[card.suit];
      if (card.valid) validCards++;
    }
    if (validCards === 0) for (const card of this.cards) card.valid = true;
    this.selected = this.selected.filter(c => c.valid);
  }

  click(c: Card): void {
    if (c.selected) {
      this.selected = this.selected.filter(card => {
        if (c === card) card.selected = false;
        return card.selected;
      });
      return;
    }
    if (!c.valid) return;

    if (this.selected.length >= this.select) {
      const shifted = this.selected.shift();
      if (shifted) shifted.selected = false;
    }
    c.selected = true;
    this.selected.push(c);
    if (this.selected.length === this.select &&
      this.lobby.playingP === this.ws.sId) {
      this.play(this.selected);
    }
  }
}
