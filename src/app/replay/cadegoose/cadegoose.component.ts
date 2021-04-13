import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { InMessage, WsService } from 'src/app/ws.service';
import { InCmd, Internal, OutCmd } from 'src/app/ws-messages';
import { Turn } from 'src/app/lobby/quacken/boats/boats.component';
import { Message } from 'src/app/chat/chat.service';
import { Boat } from 'src/app/lobby/quacken/boats/boat';
import { Subscription, Observable } from 'rxjs';
import { BoatTick } from 'src/app/lobby/quacken/hud/hud.component';
import { Lobby } from 'src/app/lobby/lobby.component';
import { boatToSync } from 'src/app/lobby/quacken/boats/convert';
import { AiRender, Points, AiData, AiBoatData } from './ai-render';
import { Scene } from 'three';
import { FormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { startWith, map } from 'rxjs/operators';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

interface ParsedTurn {
  turn: number;
  index: number;
  teams: {
    score: number;
    scoreChange: number;
    sinks: Message[];
  }[];
}

enum ClaimOption {
  MinPoints,
  DuplicateDeterence,
  RockValue,
  WindValue,
}

@Component({
  selector: 'q-replay-cadegoose',
  templateUrl: './cadegoose.component.html',
  styleUrls: ['./cadegoose.component.scss']
})
export class CadegooseComponent implements OnInit, OnDestroy {
  @ViewChild('turnTab', { static: true, read: ElementRef }) turnTab?: ElementRef<HTMLElement>;
  @Output() playTo = new EventEmitter<number>();
  @Output() pause = new EventEmitter<void>();
  @Input() seed = '';
  private _tick = 0;
  @Input() set tick(value: number) {
    const i = Math.floor((value + 2) / 30) - 1;
    this.activeTurn = this.turns[i];
    const buttons = this.turnTab?.nativeElement.children;
    buttons?.[i >= 0 ? i : 0]?.scrollIntoView({ block: 'center' });
    if (value === this._tick) return;
    this._tick = value;

    if (this.aiData && value % 30 === 28) this.getMatchAi();
    else {
      delete this.aiData;
      this.selectAiBoat();
    }
  }
  @Input() set messages(messages: InMessage[][]) {
    delete this.aiData;
    this.selectAiBoat();
    this.turns = [];
    let lastTurn = { teams: [{}, {}] } as ParsedTurn;
    for (let i = 0; i < messages.length; i++) {
      const group = messages[i];
      const sinks: Message[][] = [[], []];
      for (const m of group) {
        switch (m.cmd) {
          case InCmd.Turn:
            const turn: Turn = m.data;
            const parsed: ParsedTurn = {
              turn: this.turns.length + 1,
              index: i,
              teams: turn.points.map((score, j) => {
                const team = { score, scoreChange: score - lastTurn.teams[j].score, sinks: sinks[j] };
                if (team.scoreChange > this.maxScore) this.maxScore = team.scoreChange;
                return team;
              }),
            };
            lastTurn = parsed;
            this.turns.push(parsed);
            break;
          case InCmd.ChatMessage:
            if (m.data?.from === '_sink') sinks[m.data.copy ^ 1].push(m.data);
            break;
          default:
        }
      }
    }
  }
  tabIndex = 3;
  turns: ParsedTurn[] = [];
  maxScore = 0;
  activeTurn?: ParsedTurn;

  boats: Boat[] = [];
  boatTicks: Record<number, BoatTick> = {};
  activeBoat?: Boat;
  lobby?: Lobby;
  aiData?: AiData;
  aiTeam = 1;
  activeAiBoat?: AiBoatData;
  aiMetric: keyof Points = 'BoatAt';
  aiStep = 0;
  aiRadius = 4;
  aiRender = new AiRender();

  randomMap = '';
  claimOptions = {
    [ClaimOption.MinPoints]: 70,
    [ClaimOption.DuplicateDeterence]: 80,
    [ClaimOption.RockValue]: 50,
    [ClaimOption.WindValue]: 75,
  };
  ClaimOption = ClaimOption;
  ships = [
    { value: 27, label: 'Grand Frigate' },
    { value: 26, label: 'War Frigate' },
    { value: 25, label: 'War Galleon' },
    { value: 24, label: 'Xebec' },
    { value: 23, label: 'Merchant Galleon' },
    { value: 22, label: 'War Brig' },
    { value: 21, label: 'Junk' },
    { value: 20, label: 'Merchant Brig' },
    { value: 19, label: 'Baghlah' },
    { value: 18, label: 'Longship' },
    { value: 17, label: 'Fanchuan' },
    { value: 16, label: 'Dhow' },
    { value: 15, label: 'Cutter' },
    { value: 14, label: 'Sloop' },
  ];
  selectedShips: { value: number, label: string }[] = [this.ships[1], { ...this.ships[1] }, { ...this.ships[1] }, { ...this.ships[1] }];
  separatorKeysCodes: number[] = [ENTER, COMMA];
  shipCtrl = new FormControl();
  filteredShips: Observable<{ value: number, label: string }[]>;
  @ViewChild('shipInput') shipInput?: ElementRef<HTMLInputElement>;

  private subs = new Subscription();

  constructor(private ws: WsService) {
    this.filteredShips = this.shipCtrl.valueChanges.pipe(
      startWith(null),
      map((ship: string | null) => ship ? this._filter(ship) : this.ships.slice()));
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = (event.value || '').trim();

    if (value) {
      const ship = this.ships.find(s => s.label === value);
      if (ship) this.selectedShips.push({ ...ship });
    }

    if (input) input.value = '';
    this.shipCtrl.setValue(null);
    this.getClaims();
  }

  remove(ship: { value: number, label: string }): void {
    this.selectedShips = this.selectedShips.filter(s => s !== ship);
    this.getClaims();
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const ship = this.ships.find(s => s.label === event.option.viewValue);
    if (ship) this.selectedShips.push({ ...ship });
    if (this.shipInput) this.shipInput.nativeElement.value = '';
    this.shipCtrl.setValue(null);
    this.getClaims();
  }

  private _filter(value: string): { value: number, label: string }[] {
    const filterValue = value.toLowerCase();
    return this.ships.filter(ship => ship.label.toLowerCase().indexOf(filterValue) !== -1);
  }

  async ngOnInit() {
    this.subs.add(this.ws.fakeWs?.subscribe(Internal.Boats, (boats: Boat[]) => {
      this.boats = [...boats];
      this.findMyBoat();
    }));
    this.subs.add(this.ws.fakeWs?.subscribe(Internal.Lobby, (lobby: Lobby) => {
      this.lobby = lobby;
    }));
    this.subs.add(this.ws.fakeWs?.subscribe(Internal.Scene, (scene: Scene) => {
      scene.add(this.aiRender.object);
    }));
    this.subs.add(this.ws.fakeWs?.subscribe(Internal.BoatClicked, (boat: Boat) => {
      this.clickBoat(boat, false);
    }));
    this.subs.add(this.ws.fakeWs?.subscribe(InCmd.BoatTicks, (ticks: Record<number, BoatTick>) => {
      this.boatTicks = ticks;
      for (const boat of this.boats) boat.damage = ticks[boat.id].d;
      this.updateBoat();
    }));
    this.subs.add(this.ws.fakeWs?.subscribe(InCmd.Moves, moves => {
      if (this.activeBoat?.id === moves.t) this.updateBoat();
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private findMyBoat() {
    if (this.activeBoat) {
      const newBoat = this.boats.find(boat => boat.id === this.activeBoat?.id);
      if (newBoat && newBoat !== this.activeBoat) this.clickBoat(newBoat);
      return;
    }
    const myBoat = this.boats.find(b => b.title === this.ws.user?.name);
    if (myBoat) this.clickBoat(myBoat);
  }

  tabChange() {
    if (this.tabIndex === 0) setTimeout(() => this.tick = this._tick);
  }

  private updateBoat() {
    if (!this.activeBoat || !this.boatTicks[this.activeBoat.id]) return;
    this.ws.fakeWs?.dispatchMessage({ cmd: InCmd.BoatTick, data: this.boatTicks[this.activeBoat.id] });
    setTimeout(() => {
      if (!this.activeBoat) return;
      this.ws.fakeWs?.dispatchMessage({ cmd: Internal.MyMoves, data: { moves: this.activeBoat.moves, shots: this.activeBoat.shots } });
    });
  }

  clickTurn(turn: ParsedTurn) {
    this.playTo.emit(turn.index - 2);
    // if (this.tabIndex < 2) setTimeout(() => this.ws.fakeWs?.dispatchMessage({ cmd: Internal.CenterOnBoat }));
  }

  hoverBoat(boat: Boat, enter = true) {
    boat.render?.showInfluence(enter);
  }

  clickBoat(boat: Boat, center = true, selectAi = true) {
    if (selectAi) this.selectAiBoat(this.aiData?.boats.find(b => b.id === boat.id), false);
    if (this.activeBoat === boat) {
      if (center) this.ws.fakeWs?.dispatchMessage({ cmd: Internal.CenterOnBoat });
      return;
    }
    if (this.activeBoat) {
      this.activeBoat.isMe = false;
      this.activeBoat.render?.rebuildHeader();
    }
    boat.isMe = true;
    boat.render?.rebuildHeader();
    this.activeBoat = boat;
    this.ws.fakeWs?.dispatchMessage({ cmd: Internal.MyBoat, data: boat });
    if (center) this.ws.fakeWs?.dispatchMessage({ cmd: Internal.CenterOnBoat });
    if (this.boatTicks[boat.id]) this.updateBoat();
  }

  async getMatchAi(claimsOnly = false, sendMap = true) {
    this.pause.emit();
    if (!claimsOnly) {
      this.playTo.emit((this.activeTurn?.index || this.turns[0].index) - 2);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    const moves: Record<number, number[]> = {};
    for (const boat of this.boats) moves[boat.id] = boat.moves;
    this.aiData = await this.ws.request(OutCmd.MatchAi, {
      team: this.aiTeam,
      boats: this.boats.map(boatToSync),
      ticks: this.boatTicks,
      map: sendMap ? this.randomMap || this.lobby?.map : undefined,
      seed: this.seed,
      claimOptions: this.claimOptions,
      claimsOnly,
      moves,
    });
    if (!this.aiData) return;

    if (this.aiData.map && this.lobby) {
      this.ws.fakeWs?.dispatchMessage({ cmd: InCmd.LobbyJoin, data: { ...this.lobby, map: this.aiData.map, flags: this.aiData.flags } });
    }

    let lastBoatFound = false;
    if (!this.aiData.boats) return;
    for (const boat of this.aiData.boats) {
      if (boat.id === this.activeAiBoat?.id || boat.id === this.activeBoat?.id) {
        lastBoatFound = true;
        this.activeAiBoat = boat;
      }
      boat.boat = this.boats.find(b => b.id === boat.id);
    }
    if (lastBoatFound) this.selectAiBoat(this.activeAiBoat);
  }

  selectAiBoat(boat?: AiBoatData, clickBoat = true) {
    this.activeAiBoat = boat;
    if (clickBoat && boat?.boat) this.clickBoat(boat.boat, false, false);
    this.aiRender.setBoat(boat);
    this.aiRender.setClaims(this.aiData?.claims || []);
  }

  setAiMetric() {
    this.aiRender.setMetric(this.aiMetric);
  }

  setAiStep() {
    this.aiRender.setStep(this.aiStep);
  }

  setAiRadius() {
    this.aiRender.setRadius(this.aiRadius);
  }

  getClaims(sendMap = true) {
    if (!this.selectedShips.length) return;
    const boats = this.boats;
    this.boats = [];
    // for (const ship of this.selectedShips) {
    //   const boat = new Boat(ship.label, ship.value);
    //   boat.team = this.aiTeam;
    //   boat.id = 10000001;
    //   boat.pos.y = 30;
    //   this.boats.push(boat);
    // }
    this.getMatchAi(true, sendMap);
    this.boats = boats;
  }

}
