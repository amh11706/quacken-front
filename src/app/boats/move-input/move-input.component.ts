import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { KeyActions } from '../../settings/key-binding/key-actions';

export interface Tokens {
  moves: [number, number, number],
  shots: number,
  maneuvers: [number, number, number, number],
}

@Component({
  selector: 'q-move-input',
  templateUrl: './move-input.component.html',
  styleUrls: ['./move-input.component.scss'],
})
export class MoveInputComponent implements OnInit, OnDestroy {
  @Input() input = { moves: [0, 0, 0, 0], shots: [0, 0, 0, 0, 0, 0, 0, 0] };
  @Input() serverInput = { moves: [0, 0, 0, 0], shots: [0, 0, 0, 0, 0, 0, 0, 0] };
  @Output() inputChange = new EventEmitter<{ moves: number[], shots: number[] }>();
  @Input() reset?: Subject<void>;
  private _totalTokens: Tokens = {
    moves: [0, 0, 0],
    shots: 0,
    maneuvers: [0, 0, 0, 0],
  };

  @Input() set totalTokens(t: Tokens) {
    this._totalTokens = t;
    this.unusedTokens.moves = [...t.moves];
    this.unusedTokens.shots = t.shots;
    this.checkMaxMoves();
    this.checkMaxShots();
  }

  @Output() unusedTokensChange = new EventEmitter<Tokens>();
  private unusedTokens: Tokens = {
    moves: [0, 0, 0],
    shots: 0,
    maneuvers: [0, 0, 0, 0],
  };

  @Input() dragContext = { source: 8, move: 0 };
  @Input() private cannonForce = false;
  @Input() locked = true;
  private _maxMoves = 4;
  @Input() set maxMoves(v: number) {
    this._maxMoves = v;
    this.blockedPosition = v === 4 ? 4 : 3;
  }

  @Input() maxShots = 2;
  @Input() kbControls = 0;
  @Input() private moveKeys: Record<number, KeyActions> = {
    0: KeyActions.QBlank,
    1: KeyActions.QLeft,
    2: KeyActions.QForward,
    3: KeyActions.QRight,
    4: KeyActions.QToken,
  } as const;

  @Input() private actions = {
    bombLeft: KeyActions.QBombLeft,
    bombRight: KeyActions.QBombRight,
    BombLeftStrict: KeyActions.QBombLeftStrict,
    BombRightStrict: KeyActions.QBombRightStrict,
    tokenLeft: KeyActions.Noop,
    tokenRight: KeyActions.Noop,
    prevSlot: KeyActions.QPrevSlot,
    nextSlot: KeyActions.QNextSlot,
    ready: KeyActions.QReady,
    back: KeyActions.QBack,
  };

  blockedPosition = 3;
  selected = 0;
  private subs = new Subscription();

  constructor(
    private kbs: KeyBindingService,
  ) { }

  ngOnInit(): void {
    if (this.reset) {
      this.subs.add(this.reset.subscribe(() => {
        this.resetMoves();
        this.selected = 0;
      }));
    }
    this.subs.add(this.kbs.subscribe(this.actions.back, v => {
      if (this.locked || !v || !this.kbControls) return;

      if (this.selected && !this.input.moves[this.selected] &&
         !this.input.shots[this.selected * 2] && !this.input.shots[this.selected * 2 + 1]
      ) {
        this.selected -= 1;
      } else if (this.selected === 0 && !this.input.moves[this.selected]) {
        return this.resetMoves();
      }

      this.eraseSlot(this.selected);
      this.checkMaxMoves();
      this.checkMaxShots();
      this.inputChange.emit(this.input);
    }));

    this.subs.add(this.kbs.subscribe(this.actions.BombLeftStrict, v => {
      if (this.locked || !v || !this.kbControls) return;
      this.setBomb(this.selected * 2, true);
    }));

    this.subs.add(this.kbs.subscribe(this.actions.BombRightStrict, v => {
      if (this.locked || !v || !this.kbControls) return;
      this.setBomb(this.selected * 2 + 1, true);
    }));

    this.subs.add(this.kbs.subscribe(this.actions.bombLeft, v => {
      if (this.locked || !v || !this.kbControls) return;
      if (this.input.moves[this.selected] === 0 && this.selected > 0) this.setBomb(this.selected * 2 - 2);
      else this.setBomb(this.selected * 2);
    }));

    this.subs.add(this.kbs.subscribe(this.actions.bombRight, v => {
      if (this.locked || !v || !this.kbControls) return;
      if (this.input.moves[this.selected] === 0 && this.selected > 0) this.setBomb(this.selected * 2 - 1);
      else this.setBomb(this.selected * 2 + 1);
    }));

    for (const [key, value] of Object.entries(this.moveKeys)) {
      this.subs.add(this.kbs.subscribe(value, v => { if (v) this.placeMove(+key); }));
    }

    this.subs.add(this.kbs.subscribe(this.actions.nextSlot, v => {
      if (v && this.selected < 3 && this.kbControls) this.selected++;
    }));
    this.subs.add(this.kbs.subscribe(this.actions.prevSlot, v => {
      if (v && this.selected > 0 && this.kbControls) this.selected--;
    }));
    this.subs.add(this.kbs.subscribe(this.actions.tokenLeft, v => {
      if (this.locked || !v || !this.kbControls) return;
      this.dragContext.move = 4;
      this.dropCannon(this.selected * 2);
    }));
    this.subs.add(this.kbs.subscribe(this.actions.tokenRight, v => {
      if (this.locked || !v || !this.kbControls) return;
      this.dragContext.move = 4;
      this.dropCannon(this.selected * 2 + 1);
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  private placeMove(move: number) {
    this.dragContext.move = move;
    this.drop({} as DragEvent, this.selected);
    if (this.selected < 3) this.selected++;
  }

  private resetMoves(): void {
    for (const i in this.input.moves) this.input.moves[i] = 0;
    for (const i in this.input.shots) this.input.shots[i] = 0;
    this.unusedTokens.moves = [...this._totalTokens.moves];
    this.unusedTokens.maneuvers = [...this._totalTokens.maneuvers];
    this.unusedTokens.shots = this._totalTokens.shots;
    this.blockedPosition = this._maxMoves === 4 ? 4 : 3;
    this.inputChange.emit(this.input);
  }

  private eraseSlot(slot: number): void {
    this.input.moves[slot] = 0;
    this.input.shots[slot * 2] = 0;
    this.input.shots[slot * 2 + 1] = 0;
  }

  setBomb(i: number, strict = false): void {
    if (!strict) if (this.input.shots[i] === this.maxShots && i < 6) i += 2;
    this.addShot({ ctrlKey: strict } as MouseEvent, i);
  }

  addShot(e: MouseEvent, i: number): void {
    if (this.locked) return;
    const oldShots = this.input.shots[i] || 0;
    if (this.cannonForce && !oldShots) {
      for (const s in this.input.shots) this.input.shots[s] = 0;
      this.unusedTokens.shots = this._totalTokens.shots;
    }
    if (e.ctrlKey || e.metaKey) {
      const setTo = oldShots === this.maxShots ? 0 : this.maxShots;
      for (const shot in this.input.shots) {
        if (e.shiftKey || (i % 2 === +shot % 2 && +shot >= i)) {
          this.input.shots[shot] = setTo;
        }
      }
      this.checkMaxShots();
      this.inputChange.emit(this.input);
      return;
    }
    if (e.shiftKey) {
      const points = this.unusedTokens.maneuvers[0];
      if (points >= 100) {
        this.dragCannon(8, points === 200 ? 5 : 4);
        this.dropCannon(i);
        return;
      }
    }

    if (oldShots > 5) {
      this.input.shots[i] = 0;
    } else if (oldShots > 2) {
      this.input.shots[i] = this.maxShots > 1 ? oldShots + 2 : 0;
    } else {
      this.input.shots[i] = (oldShots + 1) % (this.maxShots + 1);
    }
    if (this.unusedTokens.shots === 0 && (this.input.shots[i] || 0) > oldShots) {
      this.input.shots[i] = 0;
    }
    this.checkMaxShots();
    this.inputChange.emit(this.input);
  }

  clickTile(ev: MouseEvent, slot: number): void {
    if (this.locked || slot === this.blockedPosition) return;
    const moves = this.input.moves;
    const move = moves[slot] || 0;
    if (ev.shiftKey) {
      const token = move > 7 ? Math.round(move / 4) - 1 : 0;
      let wantToken = (ev.button + 1 + token) % 4;
      let points = this.unusedTokens.maneuvers[wantToken] || 0;
      while (wantToken !== 0 && points < 100) {
        wantToken = (ev.button + 1 + wantToken) % 4;
        points = this.unusedTokens.maneuvers[wantToken] || 0;
      }
      if (wantToken > 0) {
        const maneuver = wantToken * 4 + 4;
        moves[slot] = points === 200 ? maneuver + 1 : maneuver;
        this.checkMaxMoves();
        this.inputChange.emit(this.input);
        return;
      }
    }
    if ((move === 0 && slot === this.blockedPosition) || move > 11) return;
    if (move > 7) {
      moves[slot] = (move + 2) % 4 + 8;
    } else {
      let wantMove = (ev.button + 1 + move) % 4;
      let tokens = this.unusedTokens.moves[wantMove - 1] || 0;
      while (wantMove !== 0 && tokens <= 0) {
        wantMove = (ev.button + 1 + wantMove) % 4;
        tokens = this.unusedTokens.moves[wantMove - 1] || 0;
      }
      moves[slot] = wantMove;
    }
    this.checkMaxMoves();
    this.inputChange.emit(this.input);
  }

  drag(move: number, slot = 8): void {
    this.dragContext.move = move;
    this.dragContext.source = slot;
  }

  dragCannon(slot = 8, token = this.input.shots[slot]): void {
    if (!token) return;
    if (token > 5) token -= 2;
    if (token < 4) token = 6;
    this.dragContext.move = token;
    this.dragContext.source = slot;
  }

  drop(ev: DragEvent, slot: number): void {
    ev.preventDefault?.();
    if (this.dragContext.source > 7 && this.blockedPosition === slot) {
      for (let i = 3; i >= 0; i--) {
        if (!this.input.moves[i] && i !== slot) {
          this.blockedPosition = i;
          break;
        }
      }
    }
    if (this.locked || (this.dragContext.source > 7 && this.blockedPosition === slot)) return;
    const moves = this.input.moves;
    if (this.dragContext.move === 0) this.blockedPosition = slot;
    else if (this.dragContext.source < 4 && this.blockedPosition === slot) {
      this.blockedPosition = this.dragContext.source;
    }

    const oldMove = moves[slot] || 0;
    moves[slot] = this.dragContext.move;
    if (this.dragContext.source < 4) moves[this.dragContext.source] = oldMove;
    else if (oldMove > 7 && oldMove < 12 && Math.floor(oldMove / 4) === Math.floor(this.dragContext.move / 4)) {
      moves[slot] = (oldMove + 2) % 4 + 8;
    }
    this.dragContext.source = 8;
    this.dragContext.move = 0;
    this.checkMaxMoves();
    this.inputChange.emit(this.input);
  }

  dragEnd(): void {
    if (this.locked || this.dragContext.source > 3) return;

    this.input.moves[this.dragContext.source] = 0;
    this.checkMaxMoves();
    this.inputChange.emit(this.input);
  }

  dragendCannon(): void {
    const shot = this.input.shots[this.dragContext.source] || 0;
    if (shot >= 6 || shot === 2) this.input.shots[this.dragContext.source] = 1;
    else this.input.shots[this.dragContext.source] = 0;
    this.checkMaxShots();
    this.inputChange.emit(this.input);
  }

  dropCannon(slot: number): void {
    if (this.locked) return;
    const oldShots = this.input.shots[slot] || 0;
    if (this.cannonForce && !oldShots) {
      for (const s in this.input.shots) this.input.shots[s] = 0;
      this.unusedTokens.shots = this._totalTokens.shots;
    }
    const isChain = this.dragContext.move !== 6;
    if (isChain) {
      this.input.shots[slot] = oldShots ? this.dragContext.move + 2 : this.dragContext.move;
    } else if (oldShots === 2 || oldShots >= 6) {
      return;
    } else {
      this.input.shots[slot] += oldShots >= 4 ? 2 : 1;
    }
    // timeout to let dragend happen first
    setTimeout(() => {
      this.dragContext.source = 8;
      this.dragContext.move = 0;
      this.checkMaxShots();
      setTimeout(() => this.inputChange.emit(this.input));
    });
  }

  private checkMaxShots() {
    this.unusedTokens.shots = this._totalTokens.shots;
    this.unusedTokens.maneuvers[0] = this._totalTokens.maneuvers[0];
    for (let i = 0; i < this.input.shots.length; i++) {
      let shot = this.input.shots[i] || 0;
      if (shot === 0) continue;
      const usingManeuver = shot >= 4;
      if (usingManeuver) {
        const points = this.unusedTokens.maneuvers[0];
        if (points === 200) this.input.shots[i] |= 0b1;
        else if (points < 100) this.input.shots[i] = 0;
        this.unusedTokens.maneuvers[0] -= points - points % 100;
        if (shot < 6) continue;
        shot = 1;
      }
      if (shot > this.unusedTokens.shots) {
        this.input.shots[i] = 0;
      } else {
        this.unusedTokens.shots -= shot;
      }
    }
    this.unusedTokensChange.emit(this.unusedTokens);
  }

  checkMaxMoves(): void {
    this.unusedTokens.moves = [...this._totalTokens.moves];
    this.unusedTokens.maneuvers[1] = this._totalTokens.maneuvers[1];
    this.unusedTokens.maneuvers[2] = this._totalTokens.maneuvers[2];
    this.unusedTokens.maneuvers[3] = this._totalTokens.maneuvers[3];
    let moveCount = 0;
    for (let i = 0; i < this.input.moves.length; i++) {
      const move = this.input.moves[i];
      if (!move) continue;
      moveCount++;
      if (moveCount > this._maxMoves) {
        this.input.moves[i] = 0;
        this.blockedPosition = i;
        continue;
      }
      if (move > 7) {
        const maneuver = Math.floor(move / 4 - 1);
        const points = this.unusedTokens.maneuvers[maneuver] || 0;
        if (points === 200) this.input.moves[i] |= 0b1;
        else if (points < 100) this.input.moves[i] = 0;
        this.unusedTokens.maneuvers[maneuver] -= points - points % 100;
      } else if (this.unusedTokens.moves[move - 1]) this.unusedTokens.moves[move - 1]--;
      else this.input.moves[i] = 0;
    }
    this.unusedTokensChange.emit(this.unusedTokens);
  }
}
