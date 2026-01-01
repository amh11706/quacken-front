import { Injectable, OnDestroy, inject } from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { Tween } from '@tweenjs/tween.js';

import { InCmd, OutCmd } from '../../../ws/ws-messages';
import { WsService } from '../../../ws/ws.service';
import { BoatStatus, Clutter, Turn } from './types';
import { Sounds, SoundService } from '../../../sound.service';
import { JobQueue } from '../../cadegoose/job-queue';
import { Boat } from './boat';
import { SettingsService } from '../../../settings/settings.service';
import { BoatsService } from './boats.service';
import { AnimationService, PlayState } from '../../cadegoose/twod-render/animation.service';

interface BoatRender {
  update(animate: boolean, trigger?: () => void): Promise<void>;
  pos: { x: number, y: number };
  boat: Boat;
}

@Injectable()
export class TurnService implements OnDestroy {
  private ws = inject(WsService);
  private ss = inject(SettingsService);
  private sound = inject(SoundService);
  private boatsService = inject(BoatsService);
  private as = inject(AnimationService);

  private turn?: Turn;
  private _turn = new Subject<Turn>();
  turn$ = this._turn.asObservable();
  animating$ = new BehaviorSubject<boolean>(false);
  get animating() { return this.animating$.value; }
  set animating(v: boolean) { this.animating$.next(v); }

  private clutterStep = new Subject<Clutter[]>();
  clutterStep$ = this.clutterStep.asObservable();

  private boats: BoatRender[] = [];
  private subs = new Subscription();
  private worker = new JobQueue();
  private graphicSettings = this.ss.prefetch('graphics');
  private get speed() { return this.graphicSettings.speed.value; }
  private animateTimeout?: number;
  private blurred = false;

  constructor() {
    this.initSubs();
    document.addEventListener('visibilitychange', this.visibilityChange);
  }

  private initSubs() {
    this.subs.add(this.ws.subscribe(InCmd.Turn, turn => this.handleTurn(turn)));
    this.subs.add(this.ws.subscribe(InCmd.Sync, () => {
      this.skipToEnd(false);
    }));
  }

  ngOnDestroy() {
    this.skipToEnd(false);
    this.subs.unsubscribe();
    document.removeEventListener('visibilitychange', this.visibilityChange);
  }

  private visibilityChange = () => {
    this.blurred = document.hidden;

    if (this.blurred) {
      if (this.animating) return this.skipToEnd(true);
    } else {
      this.boatsService.resetMymoves();
    }
  };

  skipToEnd(requestSync = true) {
    this.worker.clearJobs();
    this.as.tweens.update(Infinity);
    this.as.tweens.removeAll();
    clearTimeout(this.animateTimeout);
    delete this.animateTimeout;
    this.boatsService.resetBoats();
    this.animating = false;
    if (requestSync) setTimeout(() => this.ws.send(OutCmd.Sync));
  }

  protected handleTurn(turn: Turn): void {
    if (this.as.playState() === PlayState.Paused) return;
    if (this.animating) return;
    if (this.animateTimeout) {
      clearTimeout(this.animateTimeout);
      delete this.animateTimeout;
    }

    this.turn = turn;
    this._turn.next(turn);

    let moveFound = false;
    for (const step of turn.steps) if (step) moveFound = true;
    if (!moveFound) for (const step of turn.cSteps) if (step && step.length) moveFound = true;

    if (!moveFound || this.blurred) {
      this.boatsService.resetBoats();
      this.animateTimeout = window.setTimeout(() => this.ws.send(OutCmd.Sync), 1000);
      return;
    }

    this.animateTimeout = window.setTimeout(this.playTurn.bind(this), 100);
  }

  setBoats(boats: BoatRender[]) {
    this.boats = boats;
  }

  protected sortBoats(): void {
    this.boats.sort((a, b) => {
      if (a.pos.y > b.pos.y) return 1;
      if (a.pos.y < b.pos.y) return -1;
      return b.pos.x - a.pos.x;
    });
  }

  protected playTurn(): void {
    this.worker.clearJobs();
    this.animating = true;
    for (let step = 0; step < 8; step++) {
      void this.worker.addJob(() => this._playTurn(step));
      if (step % 2 === 1) {
        void this.worker.addJob(() => {
          return this.handleUpdate(this.turn?.cSteps[step]?.filter(c => !c.id) || [], step);
        });
      }
    }
    void this.worker.addJob(async () => {
      await new Promise<void>(resolve => {
        const start = new Date().valueOf();
        new Tween({}, this.as.tweens).to({}, 30000 / this.speed).onComplete(() => resolve()).start(start);
      });
    });
    void this.worker.addJob(() => {
      this.animating = false;
      this.ws.send(OutCmd.Sync);
    });
  }

  private handleUpdate(updates: Clutter[], step: number): Promise<void> {
    if (updates.length === 0) return Promise.resolve();
    this.clutterStep.next(updates);

    if (step % 2 !== 1) return Promise.resolve();
    return new Promise(resolve => {
      const start = new Date().valueOf();
      new Tween({}, this.as.tweens).to({}, 7000 / this.speed).onComplete(() => resolve()).start(start);
    });
  }

  private _playTurn(step: number) {
    if (!this.turn) return;
    const startTime = new Date().valueOf();
    this.as.tweenProgress = startTime;

    if (step === 4) this.boatsService.resetMymoves();
    const promises: Promise<unknown>[] = [];
    if (step % 2 === 0) promises.push(this.handleUpdate(this.turn?.cSteps[step] || [], step));
    else promises.push(this.handleUpdate(this.turn?.cSteps[step]?.filter(c => c.id) || [], step));
    const turnPart = this.turn.steps[step] || [];

    const updates = new Map<number, BoatStatus>();
    for (const u of turnPart) updates.set(u.id, u);

    for (const boat of this.boats) {
      const u = updates.get(boat.boat.id);
      boat.boat.crunchDir = -1;
      if (!u) {
        continue;
      }
      if (u.c) {
        boat.boat.addDamage(u.c - 1, u.cd);
        if (u.cd === 100) void this.sound.play(Sounds.Sink, 10000 / this.speed);
        if (u.c < 5) void this.sound.play(Sounds.RockDamage, 7500 / this.speed);
      }
      if (u.s) {
        boat.boat.face += 90 * u.s;
        boat.boat.rotateTransition = 4;
      }
      if (u.tm && u.tf !== undefined) {
        if (boat.boat.rotateTransition === 0) boat.boat.rotateTransition = 1;
        boat.boat.setTransition(u.tf, u.tm)
          .rotateByMove(u.tm);
        boat.pos.x = u.x;
        boat.pos.y = u.y;
      }

      const p = boat.update(true);
      if (p) promises.push(p);
    }

    this.sortBoats();
    // set a minimum time for the step animation
    promises.push(new Promise(resolve => {
      new Tween({}, this.as.tweens)
        .to({}, 2000 / this.speed)
        .onComplete(resolve)
        .start(startTime);
    }));
    return Promise.all(promises);
  }
}
