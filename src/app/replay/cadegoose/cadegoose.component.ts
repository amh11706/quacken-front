import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Subscription, Observable } from 'rxjs';
import { UntypedFormControl } from '@angular/forms';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { startWith, map } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { WsService } from '../../ws/ws.service';
import { InCmd, Internal, OutCmd } from '../../ws/ws-messages';
import { Boat } from '../../lobby/quacken/boats/boat';
import { AiRender } from './ai-render';
import { TeamColorsCss } from '../../lobby/cadegoose/cade-entry-status/cade-entry-status.component';
import { Penalties, PenaltyComponent } from './penalty/penalty.component';
import { SettingsService } from '../../settings/settings.service';
import { ParseTurns } from './parse-turns';
import { CadeLobby, Lobby, ParsedTurn } from '../../lobby/cadegoose/types';
import { BoatTick, MoveMessageIncoming } from '../../lobby/quacken/boats/types';
import { AiBoatData, AiData, ClaimOptions, Points, ScoreResponse } from './types';
import { InMessage } from '../../ws/ws-subscribe-types';
import { LobbyWrapperService } from '../lobby-wrapper/lobby-wrapper.service';
import { LobbyService } from '../../lobby/lobby.service';

@Component({
  selector: 'q-replay-cadegoose',
  templateUrl: './cadegoose.component.html',
  styleUrls: ['./cadegoose.component.scss'],
})
export class CadegooseComponent implements OnInit, OnDestroy {
  @ViewChild('turnTab', { static: true, read: ElementRef }) turnTab?: ElementRef<HTMLElement>;
  @ViewChild('penaltyBox', { static: false, read: ElementRef }) penaltyBox?: ElementRef<HTMLElement>;
  @Output() playTo = new EventEmitter<number>();
  @Output() pauseMatch = new EventEmitter<void>();
  @Input() seed = '';
  private _tick = 0;
  @Input() set tick(value: number) {
    for (const turn of this.turns) {
      if (turn.index > value) {
        if (turn === this.activeTurn) return;
        this.activeTurn = turn;
        break;
      }
    }
    this.centerButtons();

    if (value === this._tick) return;
    this._tick = value;

    if (this.aiData && value + 2 === this.activeTurn?.index) void this.getMatchAi();
    else {
      delete this.aiData;
      this.selectAiBoat();
    }

    if (this.activeTurn && value + 2 === this.activeTurn.index) {
      const moves: MoveMessageIncoming[] = [];
      for (const [id, m] of Object.entries(this.activeTurn.moves || {})) {
        moves.push({ t: +id, m: [...m.moves], s: [...m.shots] });
      }

      setTimeout(() => {
        void this.wrapper.ws?.dispatchMessage({ cmd: InCmd.Moves, data: moves });
      });
    }
  }

  @Input() set messages(messages: InMessage[][]) {
    delete this.aiData;
    delete this.scores;
    this.selectAiBoat();
    [this.turns, this.map, this.maxScore] = ParseTurns(messages);
    // if (this.turns.length) void this.getScores();
  }

  private map?: string;
  teamColors = TeamColorsCss;
  tabIndex = 1;
  turns: ParsedTurn[] = [];
  maxScore = 0;
  activeTurn?: ParsedTurn;

  boats: Boat[] = [];
  boatTicks: Record<number, BoatTick> = {};
  activeBoat?: Boat;
  get lobby() { return this.lobbyService.get().value; }
  aiData?: AiData;
  aiTeam = 1;
  activeAiBoat?: AiBoatData;
  aiMetric: keyof Points = 'BoatAt';
  aiStep = 0;
  aiRadius = 4;
  aiRender = new AiRender(this.wrapper.ws!, 20, 36);
  randomMap = '';
  scores?: ScoreResponse;
  maxPenalty = 0;
  Penalties = Penalties;

  penaltyColors = [
    'white',
    'red',
    'purple',
    'yellow',
    'orange',
    'green',
    'blue',
    'lime',
  ];

  claimOptions: ClaimOptions = {
    MinPoints: 70,
    DuplicateDeterence: 80,
    RockValue: 50,
    WindValue: 75,
  };

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

  selectedShips: { value: number, label: string }[] =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    [this.ships[1]!, { ...this.ships[1]! }, { ...this.ships[1]! }, { ...this.ships[1]! }];

  separatorKeysCodes: number[] = [ENTER, COMMA];
  shipCtrl = new UntypedFormControl();
  filteredShips: Observable<{ value: number, label: string }[]>;
  @ViewChild('shipInput') shipInput?: ElementRef<HTMLInputElement>;

  private subs = new Subscription();

  constructor(
    public ws: WsService,
    private dialog: MatDialog,
    private ss: SettingsService,
    private wrapper: LobbyWrapperService,
    private lobbyService: LobbyService<CadeLobby>,
  ) {
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

  ngOnInit(): void {
    this.subs.add(this.wrapper.boats?.boats$.subscribe(boats => {
      this.boats = [...boats];
      this.findMyBoat();
    }));
    this.subs.add(this.wrapper.boats?.clickedBoat$.subscribe(boat => {
      this.clickBoat(boat, true);
    }));
    this.subs.add(this.wrapper.ws?.subscribe(InCmd.BoatTicks, ticks => {
      this.boatTicks = ticks;
      for (const boat of this.boats) {
        const tick = ticks[boat.id];
        if (!tick) continue;
        boat.damage = tick.d;
        boat.bilge = tick.b;
      }
      this.updateBoat();
    }));
    this.subs.add(this.wrapper.ws?.subscribe(InCmd.Moves, moves => {
      if (!Array.isArray(moves)) moves = [moves];
      for (const move of moves) if (this.activeBoat?.id === move.t) this.updateBoat();
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

  centerButtons(): void {
    setTimeout(() => {
      const buttons = this.turnTab?.nativeElement.children;
      const buttons2 = this.penaltyBox?.nativeElement.children;
      buttons?.[(this.activeTurn?.turn || 1) - 1]?.scrollIntoView({ block: 'center' });
      buttons2?.[(this.activeTurn?.turn || 1) - 1]?.scrollIntoView({ block: 'center' });
    });
  }

  private updateBoat() {
    if (!this.activeBoat) return;
    const ticks = this.boatTicks[this.activeBoat.id];
    if (!ticks) return;
    void this.wrapper.ws?.dispatchMessage({ cmd: InCmd.BoatTick, data: ticks });
    setTimeout(() => {
      if (!this.activeBoat) return;
      void this.wrapper.ws?.dispatchMessage({
        cmd: Internal.MyMoves,
        data: { moves: this.activeBoat.moves, shots: this.activeBoat.shots },
      });
    });
  }

  clickTurn(turn?: ParsedTurn): void {
    if (!turn) return;
    this.playTo.emit(turn.index - 2);
    // if (this.tabIndex < 2) setTimeout(() => this.wrapper.ws?.dispatchMessage({ cmd: Internal.CenterOnBoat }));
  }

  clickBoat(boat: Boat, center = true, selectAi = true): void {
    if (selectAi) this.selectAiBoat(this.aiData?.boats.find(b => b.id === boat.id), false);
    if (this.activeBoat) {
      this.activeBoat.isMe = false;
    }
    if (this.activeBoat === boat && selectAi) {
      center = false;
      this.activeBoat = new Boat('');
    } else {
      this.activeBoat = boat;
    }

    if (this.wrapper.ws) {
      this.wrapper.ws.sId = this.activeBoat.id || undefined;
    }
    this.wrapper.boats?.setMyBoat(this.activeBoat);
    if (center) this.wrapper.boats?.focusMyBoat();
    if (this.boatTicks[boat.id]) this.updateBoat();
  }

  async getScores(): Promise<void> {
    if (!this.map) return;
    this.scores = await this.ws.request(OutCmd.MatchScore, {
      turns: this.turns,
      map: this.map,
    });

    if (!this.scores) return;
    const map = await this.ss.get('l/cade', 'map');
    for (const t of this.scores.totals) {
      t.map = map?.data;
      t.total = 0;
      t.turns = [[], [], [], [], [], [], [], [], [], [], []];
    }

    this.scores.turns.forEach((t, turnIndex) => {
      t.forEach((teamPenalties, team) => {
        const totals = this.scores?.totals[team];
        if (!totals) return;

        let penalty = 0;
        teamPenalties.forEach((quantity, i) => {
          if (quantity === 0) return;
          penalty += quantity * (this.Penalties[i]?.value ?? 0);
          totals.turns[i]?.push({ turn: turnIndex + 1, quantity });
        });
        if (penalty > this.maxPenalty) this.maxPenalty = penalty;
        totals.total += penalty;
      });
    });
  }

  showTotals(penalties?: ScoreResponse['totals'][0]): void {
    this.dialog.open(PenaltyComponent, {
      data: {
        rows: penalties,
        setTurn: (i: number) => this.clickTurn(this.turns[i - 1]),
      },
    });
  }

  async getMatchAi(claimsOnly = false, sendMap = true): Promise<void> {
    this.pauseMatch.emit();
    if (!claimsOnly) {
      this.playTo.emit((this.activeTurn?.index || this.turns[0]?.index || 2) - 2);
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    this.aiData = await this.ws.request(OutCmd.MatchAi, {
      team: this.aiTeam,
      boats: this.activeTurn?.sync.sync,
      ticks: this.activeTurn?.ticks,
      map: sendMap ? this.randomMap || this.lobby.map : undefined,
      seed: this.seed,
      claimOptions: this.claimOptions,
      claimsOnly,
      moves: this.activeTurn?.moves,
    });
    if (!this.aiData) return;

    if (this.aiData.map && this.lobby) {
      void this.wrapper.ws?.dispatchMessage({
        cmd: InCmd.LobbyJoin,
        data: { ...this.lobby, map: this.aiData.map, flags: this.aiData.flags } as Lobby,
      });
    }

    let lastBoatFound = false;
    if (!this.aiData.boats) return;
    for (const boat of this.aiData.boats) {
      if (boat.id === this.activeAiBoat?.id || boat.id === this.activeBoat?.id) {
        lastBoatFound = true;
        this.activeAiBoat = boat;
      }
      boat.name = this.boats.find(b => b.id === boat.id)?.name || '';
    }
    if (lastBoatFound) this.selectAiBoat(this.activeAiBoat);
  }

  selectAiBoat(boat?: AiBoatData, clickBoat = true): void {
    this.activeAiBoat = boat;
    if (clickBoat && boat) {
      const boatRender = this.boats.find(b => b.id === boat.id);
      if (boatRender) this.clickBoat(boatRender, false, false);
    }
    this.aiRender.setBoat(boat);
  }

  setAiMetric(): void {
    this.aiRender.setMetric(this.aiMetric);
  }

  setAiStep(): void {
    this.aiRender.setStep(this.aiStep);
  }

  setAiRadius(): void {
    this.aiRender.setRadius(this.aiRadius);
  }

  getClaims(sendMap = true): void {
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
    void this.getMatchAi(true, sendMap);
    this.boats = boats;
  }
}
