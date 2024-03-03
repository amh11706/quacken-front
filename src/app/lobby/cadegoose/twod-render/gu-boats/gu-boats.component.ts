import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Tween } from '@tweenjs/tween.js';
import { WsService } from '../../../../ws/ws.service';
import { Boat } from '../../../../lobby/quacken/boats/boat';
import { InCmd, Internal } from '../../../../ws/ws-messages';
import { Sounds, SoundService } from '../../../../sound.service';
import { ImageService } from '../../../../image.service';
import { GuBoat } from './gu-boat';
import { BoatService } from '../../boat.service';
import { TeamColorsCss } from '../../cade-entry-status/cade-entry-status.component';
import { MovableClutter } from './clutter';
import { Clutter, Turn } from '../../../quacken/boats/types';
import { BoatRender } from '../../boat-render';

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
export class GuBoatsComponent extends BoatService implements OnInit, OnDestroy {
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
  @Input() set hoveredTeam(v: number) {
    this._hoveredTeam = v;
    for (const boat of this.boats) {
      boat.render?.showInfluence(boat.team === v);
    }
  }

  get hoveredTeam(): number {
    return this._hoveredTeam;
  }

  private _hoveredTeam = -1;
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

  constructor(
    ws: WsService, sound: SoundService,
    private image: ImageService,
    private el: ElementRef,
  ) {
    super(ws, sound);
    this.blockRender = false;
  }

  ngOnInit(): void {
    // no super to prevent double init thanks to extended class not being a component
    this.subs.add(this.ws.subscribe(InCmd.BoatTicks, ticks => {
      for (const boat of this.boats) {
        const tick = ticks[boat.id];
        if (!tick) continue;
        boat.damage = tick.d;
        boat.bilge = tick.b;
      }
    }));

    this.subs.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => {
      if (!b.render) b.render = new GuBoat(b, undefined as any);
      GuBoat.myTeam = b.isMe ? b.team ?? 99 : 99;
      for (const boat of this.boats) {
        void this.render(boat)?.updateTeam?.(boat);
      }
    }));
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
    super.ngOnDestroy();
    GuBoat.myTeam = 99;
  }

  clickBoat(boat: Boat): void {
    this.ws.dispatchMessage({ cmd: Internal.BoatClicked, data: boat });
  }

  render(boat: Boat): GuBoat {
    return (boat.render || { orientation: {} }) as GuBoat;
  }

  protected handleUpdate(updates: Clutter[], step: number): Promise<void> {
    if (updates.length === 0) return Promise.resolve();
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
    if (step % 2 !== 1) return Promise.resolve();
    return new Promise(resolve => {
      const start = new Date().valueOf();
      new Tween({}, BoatRender.tweens).to({}, 7000 / this.speed).onComplete(() => resolve()).start(start);
    });
  }

  protected setHeaderFlags(flags: Turn['flags']): void {
    for (const boat of this.boats) if (boat.render) boat.render.flags = [];
    for (const f of flags) {
      if (f.cs) {
        for (const id of f.cs) {
          const team = f.t === this.myBoat.team ? 98 : f.t;
          this._boats[id]?.render?.flags.push({
            p: f.p, t: f.t, offset: 220 - ((FlagColorOffsets[team] ?? 9) + f.p) * 10 + 'px',
          } as any);
        }
      }
    }
    for (const boat of this.boats) {
      if (!boat.render) continue;
      boat.render.flags.sort((a, b) => {
        if (a.p > b.p) return -1;
        if (a.p < b.p) return 1;
        return b.t - a.t;
      });
    }
  }

  protected checkNewShips(): never[] {
    for (const boat of this.boats) {
      if (boat.render) continue;
      let newBoat = this._boats[boat.id];
      if (!newBoat || (newBoat.render && boat.render !== newBoat.render)) newBoat = this._boats[-boat.id];
      if (!newBoat || newBoat.render) continue;
      boat.render = new GuBoat(boat, undefined as any);
    }
    return [];
  }
}
