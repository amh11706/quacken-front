import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';

import { WsService } from '../../ws.service';
import { FriendsService } from 'src/app/chat/friends/friends.service';
import { Boat } from '../boats/boat';

@Component({
  selector: 'app-hud',
  templateUrl: './hud.component.html',
  styleUrls: ['./hud.component.css']
})
export class HudComponent implements OnInit, OnDestroy {
  @Input() kbControls = 1;
  keys = {
    "ArrowLeft": 1, "KeyA": 1,
    "ArrowUp": 2, "KeyW": 2,
    "ArrowRight": 3, "KeyD": 3,
    "ArrowDown": 0, "KeyS": 0
  };

  document = document;
  myBoat = new Boat('');

  locked = true;
  maxMoves = false;
  selected = 0;
  turn = 0;

  private source = 4;
  private move = 0;
  private subs: Subscription;

  private timeInterval: number;
  private minutes: number;
  private seconds: number;
  private turnSeconds: number;

  seconds$ = new BehaviorSubject<number>(76);

  constructor(private ws: WsService, public fs: FriendsService) { }

  ngOnInit() {
    document.addEventListener('keydown', this.kbEvent);
    this.subs = this.ws.subscribe('myBoat', boat => this.myBoat = boat);
    this.subs.add(this.ws.subscribe('unlockMoves', () => {
      this.locked = false;
      this.checkMaxMoves();
      if (this.selected < 5) this.selected = 0;
    }));
    this.subs.add(this.ws.subscribe('joinLobby', m => {
      this.turn = m.turn;
      if (m.turn > 0) this.locked = false;
      if (!this.timeInterval && m.turn < 90) this.startTimer();
      this.setTurn(90 - m.turn);
    }));
    this.subs.add(this.ws.subscribe('turn', turn => {
      if (!this.timeInterval && turn.turn < 90) this.startTimer();
      this.turn = turn.turn;
      this.setTurn(90 - turn.turn);
      this.checkMaxMoves();
      if (this.myBoat.bomb) this.myBoat.tokenPoints = 0;
    }));
    this.subs.add(this.ws.subscribe('newBoat', () => this.checkMaxMoves()));
  }

  ngOnDestroy() {
    document.removeEventListener('keydown', this.kbEvent);
    this.subs.unsubscribe();
    this.stopTimer();
  }

  private kbEvent = (e: KeyboardEvent) => {
    if (document.activeElement.id === 'textinput' || this.kbControls === 0) return;
    if (e.code === 'Enter' || e.code === 'Space') {
      this.imReady();
      return;
    }
    if (this.locked) return;
    if (e.code === 'Escape') return this.selected = -1;
    if (this.selected === -1) return this.selected = 0;

    if (e.code === 'Backspace' || e.code === 'KeyZ' && e.ctrlKey) {
      if (this.selected > 0 && (this.selected < 3 || this.myBoat.moves[this.selected] === 0)) {
        this.selected -= 1;
      } else if (this.selected === 0) {
        this.setBomb(0);
        this.myBoat.moves = [0, 0, 0, 0];
      }
      this.myBoat.moves[this.selected] = 0;
      this.checkMaxMoves();
      this.ws.send('s', this.myBoat.moves);
      return;
    }
    if (e.code === 'KeyQ') {
      if (this.selected > 0 && this.myBoat.moves[this.selected] === 0) {
        return this.setBomb(this.selected);
      }
      return this.setBomb(this.selected + 1);
    }
    if (e.code === 'KeyE') {
      if (this.selected > 0 && this.myBoat.moves[this.selected] === 0) {
        return this.setBomb(this.selected + 4);
      }
      return this.setBomb(this.selected + 5);
    }

    const move = this.keys[e.code];
    if (typeof move !== 'number') return;
    if (e.shiftKey) {
      if (move === 2) {
        if (this.selected > 0) this.selected -= 1;
      } else if (move === 0) {
        if (this.selected < 3) this.selected += 1;
      } else if (move === 1) {
        this.setBomb(this.selected + 1);
      } else if (move === 3) {
        this.setBomb(this.selected + 5);
      }
    } else {
      if (this.maxMoves && move !== 0 && this.myBoat.moves[this.selected] === 0) {
        if (this.selected < 3) this.selected += 1;
        return;
      }
      this.myBoat.moves[this.selected] = move;
      if (this.selected < 3) this.selected += 1;
      this.checkMaxMoves();
      this.ws.send('s', this.myBoat.moves);
    }
  };

  checkMaxMoves() {
    if (this.myBoat.type === 0) return this.maxMoves = false;
    const moveCount = this.myBoat.moves.reduce((a, c) => a + +(c > 0), 0);
    this.maxMoves = moveCount >= 3;
  }

  setBomb(i: number) {
    if (this.locked || this.myBoat.type !== 2 || this.myBoat.tokenPoints < 2) return;
    if (this.myBoat.bomb === i) this.myBoat.bomb = 0;
    else this.myBoat.bomb = i;
    this.ws.send("b", this.myBoat.bomb);
  }

  imReady() {
    if (this.myBoat.ready) return;
    this.myBoat.ready = true;
    this.locked = true;
    this.ws.send('r');
  }

  start() {
    this.ws.send("c/start", "");
  }

  clickTile(ev: MouseEvent, slot: number) {
    this.selected = -1;
    if (this.locked) return;
    const boat = this.myBoat;
    if (boat.type !== 0 && this.maxMoves && boat.moves[slot] === 0) return;
    boat.moves[slot] = (ev.which + boat.moves[slot]) % 4;
    this.checkMaxMoves();
    this.ws.send('s', boat.moves);
  }

  drag(move: number, slot: number = 4) {
    this.selected = -1;
    this.move = move;
    this.source = slot;
  }

  drop(ev: DragEvent, slot: number) {
    this.selected = -1;
    ev.preventDefault();
    if (this.locked) return;
    const boat = this.myBoat;
    if (boat.type !== 0 && this.maxMoves && this.source > 3 && boat.moves[slot] === 0) return;

    if (this.source < 4) boat.moves[this.source] = boat.moves[slot];
    boat.moves[slot] = this.move;
    this.checkMaxMoves();
    this.ws.send('s', boat.moves);

    this.source = 4;
  }

  dragEnd() {
    if (this.locked || this.source > 3) return;

    this.myBoat.moves[this.source] = 0;
    this.checkMaxMoves();
    this.ws.send('s', this.myBoat.moves);
  }

  setTurn(turn: number, sec: number = 19) {
    if (turn === 90) sec = 0;
    else if (turn < 0) {
      this.endRound();
      return;
    }

    this.minutes = Math.floor(turn / 3);
    this.seconds = (turn - this.minutes * 3) * 20 + sec;
    this.turnSeconds = sec;
    this.updatetime();
  }

  private endRound(): void {
    this.ws.dispatchMessage({ cmd: 'time', data: '0:00' });
    this.seconds$.next(0);
    this.stopTimer();
  }

  startTimer(ms: number = 1000) {
    clearInterval(this.timeInterval);
    this.timeInterval = window.setInterval(() => this.tickTimer(), ms);
  }

  stopTimer() {
    clearInterval(this.timeInterval);
    this.timeInterval = null;
  }

  private tickTimer() {
    if (this.minutes === 30) return;
    if (this.turnSeconds < 1 || this.minutes + this.seconds === 0) {
      this.imReady();
      return;
    }

    this.seconds--;
    this.updatetime();

    this.turnSeconds--;
    this.seconds$.next(this.turnSeconds * 4 - 4);
  }

  private updatetime(): void {
    const seconds = this.seconds < 10 ? '0' + this.seconds : this.seconds;
    this.ws.dispatchMessage({ cmd: 'time', data: this.minutes + ':' + seconds });
  }

}
