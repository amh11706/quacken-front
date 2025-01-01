import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Boat } from '../../../../lobby/quacken/boats/boat';
import { Sounds, SoundService } from '../../../../sound.service';
import { ImageService } from '../../../../image.service';
import { GuBoat } from './gu-boat';
import { TeamColorsCss } from '../../cade-entry-status/cade-entry-status.component';
import { MovableClutter } from './clutter';
import { Clutter, Turn } from '../../../quacken/boats/types';
import { BoatsService } from '../../../quacken/boats/boats.service';
import { BehaviorSubject, Subscription } from 'rxjs';
import { TurnService } from '../../../quacken/boats/turn.service';

export const FlagColorOffsets: Readonly<Record<number, number>> = {
  0: 3,
  1: 6,
  2: 15,
  3: 18,
  98: 0,
  99: 9,
  100: 12,
};

const CannonSounds: Record<number, Sounds> = {
  0: Sounds.CannonFireSmall,
  1: Sounds.CannonFireMedium,
  2: Sounds.CannonFireBig,
};

@Component({
  selector: 'q-gu-boats',
  templateUrl: './gu-boats.component.html',
  styleUrls: ['./gu-boats.component.scss'],
})
export class GuBoatsComponent implements OnInit, OnDestroy {
  @Input() showIsland = false;
  protected _speed = 15;
  @Input() set speed(v: number) {
    this._speed = v;
    this.el.nativeElement.style.setProperty('--speed', (10 / v));
  }
  get speed(): number {
    return this._speed;
  }

  @Input() fishBoats = 0;
  private _hoveredTeam = -1;
  @Input() set hoveredTeam(v: number) {
    this._hoveredTeam = v;
  }
  get hoveredTeam(): number {
    return this._hoveredTeam;
  }

  @Input() map?: HTMLElement;
  @Input() checkSZ = (pos: { x: number, y: number }): boolean => {
    if (!this.showIsland) return false;
    return pos.y > 32 || pos.y < 3;
  };

  @Input() getX = (p: { x: number, y: number }): number => (p.x + p.y) * 32;
  @Input() getY = (p: { x: number, y: number }): number => (p.y - p.x + 19) * 24;
  @Input() setTile?: (x: number, y: number, v: number) => void;
  clutter: MovableClutter[] = [];
  teamColors = TeamColorsCss;
  moveTransition = (transition?: number): string => {
    switch (transition) {
      case 0: return '0s linear';
      case 1: return 10 / this.speed + 's linear';
      case 2:
      case 3:
      case 4: return 6 / this.speed + 's linear';
      default: return '';
    }
  };

  private subs = new Subscription();
  private boatRenders = new Map<number, GuBoat>();
  boatRenders$ = new BehaviorSubject<GuBoat[]>([]);
  myBoat = new Boat('');

  constructor(
    private sound: SoundService,
    private image: ImageService,
    private el: ElementRef,
    private boats: BoatsService,
    private turn: TurnService,
  ) { }

  ngOnInit(): void {
    this.subs.add(this.boats.myBoat$.subscribe(b => {
      if (!this.boatRenders.has(b.id)) this.boatRenders.set(b.id, new GuBoat(b));
      GuBoat.myTeam = b.isMe ? b.team ?? 99 : 99;
      this.boatRenders.forEach(r => {
        void r.updateTeam();
      });
      this.myBoat = b;
    }));

    this.subs.add(this.boats.boats$.subscribe(b => this.checkBoats(b)));
    this.subs.add(this.boats.clutter$.subscribe(c => this.handleUpdate(c)));
    this.subs.add(this.turn.turn$.subscribe(t => {
      this.clutter = [];
      this.setHeaderFlags(t.flags);
    }));
    this.subs.add(this.turn.clutterStep$.subscribe(c => this.handleUpdate(c)));

    void this.sound.load(Sounds.CannonFireBig);
    void this.sound.load(Sounds.CannonFireMedium);
    void this.sound.load(Sounds.CannonFireSmall);
    void this.sound.load(Sounds.CannonHit);
    void this.sound.load(Sounds.CannonSplash);
    void this.sound.load(Sounds.CannonSplash2);
    void this.sound.load(Sounds.Sink);
    void this.sound.load(Sounds.RockDamage);
    this.image.load('/assets/clutter/cannonball_small.png');
    this.image.load('/assets/clutter/cannonball_medium.png');
    this.image.load('/assets/clutter/cannonball_large.png');
    this.image.load('/assets/clutter/cannonball_healing.png');
    this.image.load('/assets/clutter/cannonball_healing_gold.png');
    this.image.load('/assets/clutter/chain_cannonball.png');
    this.image.load('/assets/clutter/flaming_cannonball.png');
    this.image.load('/assets/clutter/explode_small.png');
    this.image.load('/assets/clutter/explode_medium.png');
    this.image.load('/assets/clutter/explode_large.png');
    this.image.load('/assets/clutter/wave.png');
    this.image.load('/assets/clutter/wave2.png');
    this.image.load('/assets/clutter/flotsam.png');
    this.image.load('/assets/clutter/flaming_flotsam.png');
    this.image.load('/assets/clutter/hit.png');
    this.image.load('/assets/clutter/splash_large.png');

    // setTimeout(() => {
    //   void this.handleUpdate([
    //     { x: 2, y: 4, t: 17, dir: 0 },
    //   ], 0);
    // }, 1000);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    GuBoat.myTeam = 99;
  }

  clickBoat(boat: Boat): void {
    this.boats.clickBoat(boat);
  }

  protected handleUpdate(updates: Clutter[]) {
    const startTime = new Date().valueOf();
    for (const u of updates) {
      if (u.u && this.setTile) {
        setTimeout(() => {
          if (!u.u || !this.setTile) return;
          for (const t of u.u) this.setTile(t.x, t.y, t.v);
        }, 12000 / this.speed);
      }
      const oldClutter = u.id && this.clutter.find(c => c.id === u.id);
      if (oldClutter) {
        Object.assign(oldClutter, u, { p: oldClutter.p });
        void oldClutter.updatePos(startTime, u.x, u.y).then(() => oldClutter.p = u.p);
      } else {
        this.clutter.push(new MovableClutter(u));
      }
      if (!u.dis) continue;
      const fireSound = CannonSounds[u.t - 2] || Sounds.CannonFireBig;
      void this.sound.play(fireSound);
      if (u.dbl) void this.sound.play(fireSound, 1000 / this.speed);
      if (u.dis < 4) {
        void this.sound.play(Sounds.CannonHit, (2500 * u.dis + 1500) / this.speed);
        if (u.dbl) void this.sound.play(Sounds.CannonHit, (2500 * u.dis + 2500) / this.speed);
      } else {
        void this.sound.play(Sounds.CannonSplash, 9000 / this.speed);
        if (u.dbl) void this.sound.play(Sounds.CannonSplash2, 10000 / this.speed);
      }
    }
  }

  protected setHeaderFlags(flags: Turn['flags']): void {
    this.boatRenders.forEach(r => r.flags = []);
    for (const f of flags) {
      if (f.cs) {
        for (const id of f.cs) {
          const team = f.t === GuBoat.myTeam ? 98 : f.t;
          this.boatRenders.get(id)?.flags.push({
            p: f.p, t: f.t, offset: 220 - ((FlagColorOffsets[team] ?? 9) + f.p) * 10 + 'px',
          });
        }
      }
    }
    this.boatRenders.forEach(r => {
      r.flags.sort((a, b) => {
        if (a.p > b.p) return -1;
        if (a.p < b.p) return 1;
        return b.t - a.t;
      });
    });
  }

  trackBoat(_: number, boat: GuBoat): number {
    return boat.boat.id;
  }

  protected checkBoats(boats: Iterable<Boat>): void {
    const touchedBoats = new Set<number>();
    for (const b of boats) {
      touchedBoats.add(b.id);
      if (!this.boatRenders.has(b.id)) this.boatRenders.set(b.id, new GuBoat(b));
      const r = this.boatRenders.get(b.id);
      if (!r) continue;
      r.boat = b;
    }
    this.boatRenders.forEach((r, id) => {
      if (!touchedBoats.has(id)) {
        this.boatRenders.delete(id);
        return;
      }
      r.update(false);
    });
    this.boatRenders$.next(Array.from(this.boatRenders.values()));
    this.turn.setBoats(this.boatRenders$.value);
  }
}
