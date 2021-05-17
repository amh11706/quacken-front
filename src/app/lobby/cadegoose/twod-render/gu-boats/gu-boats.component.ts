import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { BoatService, checkSZ } from '../../boat.service';
import { GuBoat, Point } from './gu-boat';
import { WsService } from 'src/app/ws.service';
import { Boat } from 'src/app/lobby/quacken/boats/boat';
import { Turn, Clutter } from 'src/app/lobby/quacken/boats/boats.component';
import { Internal } from 'src/app/ws-messages';
import { Sounds, SoundService } from 'src/app/sound.service';

const FlagColorOffsets: Record<number, number> = {
  0: 3,
  1: 6,
  98: 0,
  99: 9,
  100: 12,
};

const CannonSounds: Record<number, Sounds> = {
  0: Sounds.CannonFireSmall,
  1: Sounds.CannonFireMedium,
  2: Sounds.CannonFireBig,
}

@Component({
  selector: 'q-gu-boats',
  templateUrl: './gu-boats.component.html',
  styleUrls: ['./gu-boats.component.scss'],
})
export class GuBoatsComponent extends BoatService implements OnInit, OnDestroy {
  @Input() showIsland = false;
  @Input() speed = 15;
  @Input() set hoveredTeam(v: number) {
    for (const boat of this.boats) {
      boat.render?.showInfluence(boat.team === v);
    }
  }
  @Input() map?: HTMLElement;
  protected checkSZ = (pos: { x: number, y: number }) => {
    if (!this.showIsland) return false;
    return checkSZ(pos);
  }
  @Input() getX = (p: { x: number, y: number }): number => (p.x + p.y) * 32;
  @Input() getY = (p: { x: number, y: number }): number => (p.y - p.x + 19) * 24;
  moveTransition = (transition: number): string => {
    switch (transition) {
      case 0: return '0s linear';
      case 1: return 10 / this.speed + 's linear';
      case 2:
      case 3:
      case 4: return 6 / this.speed + 's linear';
      default: return '';
    }
  }

  constructor(ws: WsService, sound: SoundService) {
    super(ws, sound);
    this.blockRender = false;
  }

  ngOnInit() {
    // no super to prevent double init thanks to extended class not being a component
    this.subs.add(this.ws.subscribe(Internal.MyBoat, (b: Boat) => {
      if (!b.render) b.render = new GuBoat(b, undefined as any);
      GuBoat.myTeam = b.isMe ? b.team ?? 99 : 99;
    }));
    this.sound.load(Sounds.CannonFireBig);
    this.sound.load(Sounds.CannonFireMedium);
    this.sound.load(Sounds.CannonFireSmall);
    this.sound.load(Sounds.CannonHit);
    this.sound.load(Sounds.CannonSplash);
    this.sound.load(Sounds.CannonSplash2);
    this.sound.load(Sounds.Sink);
    this.sound.load(Sounds.RockDamage);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    GuBoat.myTeam = 99;
  }

  clickBoat(boat: Boat) {
    this.ws.dispatchMessage({ cmd: Internal.BoatClicked, data: boat });
  }

  render(boat: Boat): GuBoat {
    return (boat.render || { orientation: {} }) as GuBoat;
  }

  protected handleUpdate(updates: Clutter[], step: number): Promise<void> {
    if (updates.length === 0) return Promise.resolve();
    for (const u of updates) {
      const p = new Point().fromPosition(u);
      u.transform = `translate(${p.x}px, ${p.y}px)`;
      if (!u.dis) continue;
      const fireSound = CannonSounds[u.t - 2];
      this.sound.play(fireSound);
      if (u.dbl) this.sound.play(fireSound, 1000 / this.speed);
      if (u.dis < 4) {
        this.sound.play(Sounds.CannonHit, 2500 * u.dis / this.speed);
        if (u.dbl) this.sound.play(Sounds.CannonHit, (2500 * u.dis + 1000) / this.speed);
      } else {
        this.sound.play(Sounds.CannonSplash, 7500 / this.speed);
        if (u.dbl) this.sound.play(Sounds.CannonSplash2, 8500 / this.speed);
      }
    }
    this.clutter.push(...updates);
    return new Promise(resolve => setTimeout(resolve, step % 2 === 1 ? 7000 / this.speed : 0));
  }

  protected setHeaderFlags(flags: Turn['flags']) {
    for (const boat of this.boats) if (boat.render) boat.render.flags = [];
    for (const f of flags) {
      if (f.cs) for (const id of f.cs) {
        const team = f.t === this.myBoat.team ? 98 : f.t;
        this._boats[id]?.render?.flags.push({
          p: f.p, t: f.t, offset: 160 - (FlagColorOffsets[team] + f.p) * 10 + 'px',
        } as any);
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

  protected checkNewShips() {
    for (const boat of this.boats) {
      if (boat.render) continue;
      let newBoat = this._boats[boat.id];
      if (!newBoat || newBoat.render && boat.render !== newBoat.render) newBoat = this._boats[-boat.id];
      if (!newBoat || newBoat.render) continue;
      boat.render = new GuBoat(boat, undefined as any);
    }
    return [];
  }
}
