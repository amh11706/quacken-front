import { Component, OnInit, ViewChild, ElementRef, Input, NgZone, AfterViewInit, ChangeDetectorRef, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { Subscription } from 'rxjs';
import Stats from 'three/examples/jsm/libs/stats.module';

import { SettingsService } from '../../../settings/settings.service';
import { InCmd, Internal } from '../../../ws/ws-messages';
import { WsService } from '../../../ws/ws.service';
import { Boat } from '../../quacken/boats/boat';
import { JsonSprite, Sprite, SpriteImage } from './sprite';
import { BigRockData } from './objects/big_rock';
import { SmallRockData } from './objects/small_rock';
import { FlagData } from './objects/flags';
import { GuBoat, Point, Position } from './gu-boats/gu-boat';
import { BoatRender3d } from '../boat-render';
import { MapComponent } from '../../../map-editor/map/map.component';
import { MapEditor, MapTile } from '../../../map-editor/types';
import { Turn } from '../../quacken/boats/types';
import { CadeLobby } from '../types';
import { BoatsService } from '../../quacken/boats/boats.service';

type flagIndex = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | '11' | '12' | '13' | '14';
type index = 0 | 1 | 2 | 3;

export const FlagColorOffsets: Readonly<Record<number, number>> = {
  0: 0,
  1: 3,
  2: 15,
  3: 18,
  98: 6,
  99: 9,
  100: 12,
};

type FlagMap = Map<string, Turn['flags'][0]>
@Component({
  selector: 'q-twod-render',
  templateUrl: './twod-render.component.html',
  styleUrls: ['./twod-render.component.scss'],
})
export class TwodRenderComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  readonly rotationSeed = Math.random() * (Number.MAX_SAFE_INTEGER / 2) + 99999999;
  @ViewChild('canvas', { static: true }) canvasElement?: ElementRef<HTMLCanvasElement>;
  @ViewChild('fps') fps?: ElementRef<HTMLElement>;
  @ViewChild('frame') frame?: ElementRef<HTMLElement>;
  @Input() lobby: CadeLobby | undefined;
  @Input() hoveredTeam = -1;
  @Input() mapHeight = 36;
  @Input() mapWidth = 20;
  @Input() safeZone = true;
  @Input() showIsland = this.safeZone;
  myBoat = new Boat('');

  @Input() speed = 15;
  @Input() fishBoats = 0;
  @Input() set map(map: number[][]) { void this.fillMap(map, []); }
  mapUtil = new MapComponent();
  @Input() set editor(e: MapEditor) { this.mapUtil.map = e; }
  @Input() set undo(u: (source: MapTile[][], target: MapTile[][]) => void) { this.mapUtil.undo = u; }
  @Input() set setTile(st: ((x: number, y: number, v: number) => MapTile | void) | 0) {
    this.mapUtil.setTile = st || undefined;
  }

  @Input() ctrlZoom = false;

  get mapScale(): number { return (this.graphicSettings.mapScale.value / 50) || 1; }
  @Input() graphicSettings = this.ss.prefetch('graphics');

  protected drawRocks = false;
  @Input() checkSZ = (pos: { x: number, y: number }): boolean => {
    if (!this.showIsland) return false;
    return pos.y > 32 || pos.y < 3;
  };

  private frameRequested = true;
  private frameTarget = 0;
  private lastFrame = 0;
  private alive = true;
  private stats?: Stats;

  private static water = new Sprite('cell', 64, 48, [[0, 0], [64, 0], [128, 0], [192, 0], [256, 0]]);
  private static sz = new Sprite('safezone', 64, 48, [[0, 0], [64, 0], [128, 0], [192, 0], [256, 0]]);
  private static wind = new Sprite('wind', 64, 48, [[192, 0], [0, 0], [64, 0], [128, 0]]);
  private static whirl = new Sprite('whirl2', 64, 48, [[64, 0], [128, 0], [192, 0], [0, 0], [320, 0], [384, 0], [448, 0], [256, 0]]);
  private static rock = new JsonSprite(BigRockData);
  private static smallRock = new JsonSprite(SmallRockData);
  private static flag = new Sprite('buoy', 50, 69, [
    [50, 0], [50, 69], [50, 138],
    [100, 0], [100, 69], [100, 138],
    [0, 0], [0, 69], [0, 138],
    [250, 0], [250, 69], [250, 138],
    [200, 0], [200, 69], [200, 138],
  ]);

  private sub = new Subscription();
  protected canvas?: CanvasRenderingContext2D | null;

  obstacles: { t: number, points?: number, cs?: number[], zIndex: number, sprite: SpriteImage }[] = [];
  flags: {
    x: number, y: number, t: number, points?: number, cs?: number[], zIndex: number, sprite: SpriteImage
  }[] = [];

  getX = (p: { x: number, y: number }): number => (p.x + p.y) * 32;
  getY = (p: { x: number, y: number }): number => (p.y - p.x + this.mapWidth - 1) * 24;
  getXOff = (boat: Boat): number => boat.isMe ? this.getX(boat.pos) : this.getWidth() / 2;
  getYOff = (boat: Boat): number => boat.isMe ? this.getY(boat.pos) : this.getHeight() / 2;

  moveTransition = (transition: number): string => {
    switch (transition) {
      case 0: return '0s linear';
      case 1: return 10 / this.speed + 's linear';
      case 2: return 10 / this.speed + 's ease-in';
      case 3: return 10 / this.speed + 's ease-out';
      case 4: return '.1s linear';
      default: return '';
    }
  };

  @ViewChild('overlay', { static: false }) overlay?: ElementRef<HTMLDivElement>;

  constructor(
    private ss: SettingsService,
    private ws: WsService,
    private ngZone: NgZone,
    private cd: ChangeDetectorRef,
    private boats: BoatsService,
  ) { }

  ngOnInit(): void {
    this.sub.add(this.ws.subscribe(Internal.Canvas, c => {
      this.overlay?.nativeElement.appendChild(c);
    }));
    this.sub.add(this.boats.myBoat$.subscribe(b => {
      this.myBoat = b;
      this.colorFlags();
    }));

    this.sub.add(this.ws.subscribe(InCmd.Turn, (t: Turn) => {
      if (!t.flags) return;
      if (this.lobby) this.lobby.flags = t.flags;
      const flagMap: FlagMap = new Map();
      for (const f of t.flags) flagMap.set(`${f.x},${f.y}`, f);
      this.colorFlags(flagMap);
    }));
    this.sub.add(this.boats.focusMyBoat$.subscribe(() => {
      this.frame?.nativeElement.dispatchEvent(new Event('dblclick'));
    }));

    this.frameRequested = false;
    this.ngZone.runOutsideAngular(this.requestRender.bind(this));
  }

  ngAfterViewInit(): void {
    this.stats = Stats();
    this.fps?.nativeElement.appendChild(this.stats.dom);
    this.stats.dom.style.position = 'relative';
    this.resize();
  }

  protected resize(): void {
    GuBoat.widthOffset = this.mapWidth - 1;
    if (this.canvasElement) {
      this.canvasElement.nativeElement.width = this.getWidth();
      this.canvasElement.nativeElement.height = this.getHeight();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.mapHeight || changes.mapWidth) {
      this.resize();
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    this.alive = false;
  }

  private animate = () => {
    const t = new Date().valueOf();
    if (!this.lastFrame) this.lastFrame = t;
    if (t < this.frameTarget) {
      this.frameRequested = false;
      this.requestRender();
      return;
    }
    this.frameTarget = Math.max(t, this.frameTarget + 1000 / this.graphicSettings.maxFps.value);

    BoatRender3d.speed = this.speed;
    // progress 0 means no animations are running, so we can skip the update
    if (!BoatRender3d.paused && BoatRender3d.tweenProgress > 0) {
      BoatRender3d.tweenProgress += (t - this.lastFrame);
      BoatRender3d.tweens.update(BoatRender3d.tweenProgress);
      this.cd.detectChanges();
    }
    this.stats?.update();
    this.frameRequested = false;
    this.lastFrame = t;
    this.requestRender();
  };

  private requestRender = () => {
    if (!this.alive || this.frameRequested) return;
    this.frameRequested = true;
    window.requestAnimationFrame(this.animate);
  };

  getHeight(): number {
    return (this.mapWidth + this.mapHeight) * 24;
  }

  getWidth(): number {
    return (this.mapWidth + this.mapHeight) * 32;
  }

  protected getScale(): number {
    return 1;
  }

  colorFlags(flags?: FlagMap): void {
    if (this.flags.length === 0) return;
    if (flags) {
      for (const flag of this.flags) {
        if (flag) flag.t = flags.get(`${flag.x},${flag.y}`)?.t ?? flag.t;
      }
    }
    for (const f of this.flags) {
      if (f.points === undefined) continue;
      const team = f.t !== undefined && f.t === this.myBoat.team ? 98 : f.t;
      const offset = FlagColorOffsets[team] ?? FlagColorOffsets[99] ?? 9;
      const pixel = FlagData.orientations[(f.points + offset).toString() as flagIndex];
      f.sprite.imgPosition = `-${pixel.x}px -${pixel.y}px`;
      f.sprite.orientation = pixel;
    }
  }

  public addObstacle(
    x: number, y: number, tile: number, flags: FlagMap,
  ): void {
    const obstacle = new Point().fromPosition({ x, y });
    const pOffsetX = obstacle.x;
    const pOffsetY = obstacle.y;
    const rand = Math.floor(this.rotationSeed / (x + 1) / (y + 1)) % 4;
    if (tile >= 21 && tile <= 23) {
      const flag = new SpriteImage(FlagData);
      flag.pOffsetX = pOffsetX;
      flag.pOffsetY = pOffsetY;
      const flagObj = {
        t: flags.get(`${x},${y}`)?.t ?? 99,
        points: tile - 21,
        zIndex: (pOffsetY - 23),
        sprite: flag,
        x,
        y,
      };
      this.obstacles.push(flagObj);
      this.flags.push(flagObj);
    } else if (tile === 50) {
      const bigRock = new SpriteImage(BigRockData);
      bigRock.pOffsetX = pOffsetX;
      bigRock.pOffsetY = pOffsetY;
      bigRock.orientation = BigRockData.orientations[rand as index];
      bigRock.imgPosition = `-${bigRock.orientation.x}px -${bigRock.orientation.y}px`;
      this.obstacles.push({ t: tile, zIndex: (pOffsetY - 10), sprite: bigRock });
    } else if (tile === 51) {
      const smallRock = new SpriteImage(SmallRockData);
      smallRock.pOffsetX = pOffsetX;
      smallRock.pOffsetY = pOffsetY;
      smallRock.orientation = SmallRockData.orientations[rand as index];
      smallRock.imgPosition = `-${smallRock.orientation.x}px -${smallRock.orientation.y}px`;
      this.obstacles.push({ t: tile, zIndex: (pOffsetY - 10), sprite: smallRock });
    }
  }

  async fillMap(map: number[][], flags: Turn['flags']): Promise<void> {
    const flagMap: FlagMap = new Map();
    for (const f of flags) flagMap.set(`${f.x},${f.y}`, f);
    await Promise.all([
      TwodRenderComponent.wind,
      TwodRenderComponent.whirl,
      TwodRenderComponent.water,
      TwodRenderComponent.sz,
      TwodRenderComponent.rock,
      TwodRenderComponent.smallRock,
      TwodRenderComponent.flag,
    ]);
    const wasLoaded = !!this.canvas;
    if (!this.canvas) {
      this.canvas = this.canvasElement?.nativeElement.getContext('2d');
    }
    if (!this.canvas) return;
    const ctx = this.canvas;
    ctx.save();
    ctx.scale(this.getScale(), this.getScale());
    if (wasLoaded) {
      ctx.clearRect(0, -(this.mapWidth * 24 - 24), this.getWidth(), this.getHeight());
    }
    ctx.translate(0, this.mapWidth * 24 - 24);
    this.obstacles = [];
    this.flags = [];
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        const xOffset = (x + y) * 32;
        const yOffset = (-x + y) * 24;
        const rand = Math.floor(this.rotationSeed / (x + 1) / (y + 1)) % 5;
        if (this.safeZone && (y > this.mapHeight - 4 || y < 3)) {
          TwodRenderComponent.sz.draw(ctx, rand, xOffset, yOffset);
        } else TwodRenderComponent.water.draw(ctx, rand, xOffset, yOffset);
        const tile = map[y]?.[x];
        if (!tile) continue;

        else if ((tile >= 21 && tile <= 23) || tile === 50 || tile === 51) {
          if (!this.drawRocks) this.addObstacle(x, y, tile, flagMap);
          else if (tile >= 50) {
            const rand = Math.floor(this.rotationSeed / (x + 1) / (y + 1)) % 4;
            if (tile === 50) TwodRenderComponent.rock.draw(ctx, rand, xOffset, yOffset);
            else if (tile === 51) TwodRenderComponent.smallRock.draw(ctx, rand, xOffset, yOffset);
          } else {
            const offset = FlagColorOffsets[99] ?? 9;
            TwodRenderComponent.flag.draw(ctx, tile - 21 + offset, xOffset + 7, yOffset - 33);
          }
        } else if (tile > 8) TwodRenderComponent.whirl.draw(ctx, tile - 9, xOffset, yOffset);
        else if (tile > 4) TwodRenderComponent.wind.draw(ctx, (tile - 1) % 4, xOffset, yOffset);
      }
    }
    ctx.restore();
    this.colorFlags();
  }

  zoomChange(e: number): void {
    this.graphicSettings.mapScale.value = Math.round(e * 50);
  }

  extractCoord(event: MouseEvent): Position {
    const rect = this.canvasElement?.nativeElement.getBoundingClientRect();
    if (!rect) throw new Error('canvas bounding box not found!');
    const x = (event.clientX - rect.left) / this.mapScale;
    const y = ((event.clientY - rect.top - 24) / this.mapScale);
    const position = new Position().fromPoint({ x, y });
    position.x = Math.floor(position.x);
    position.y = Math.floor(position.y);
    return position;
  }

  mousedown(event: MouseEvent): void {
    if (this.lobby?.inProgress) return;
    const p = this.extractCoord(event);
    this.mapUtil.clickTile(event, p.x, p.y);
  }

  mouseup(event: MouseEvent): void {
    if (this.lobby?.inProgress) return;
    const p = this.extractCoord(event);
    this.mapUtil.mouseUp(event, p.x, p.y);
  }

  mousemove(event: MouseEvent): void {
    if (!this.mapUtil.painting) return;
    const p = this.extractCoord(event);
    this.mapUtil.clickTile(event, p.x, p.y);
  }

  fpsOffsetChange(event: { x: number, y: number }): void {
    this.graphicSettings.showFps.data = event;
    this.graphicSettings.showFps.emit();
  }
}
