import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { Tokens } from '../move-input/move-input.component';

@Component({
  selector: 'q-move-source',
  templateUrl: './move-source.component.html',
  styleUrls: ['./move-source.component.scss'],
})
export class MoveSourceComponent implements OnDestroy {
  @Input() tokenStrings = ['', '', ''];
  @Input() dragContext = { source: 8, move: 0 };
  private _totalTokens?: Tokens;
  @Input() set totalTokens(t: Tokens) {
    if (
      this._totalTokens?.moves[0] !== t.moves[0] ||
      this._totalTokens?.moves[1] !== t.moves[1] ||
      this._totalTokens?.moves[2] !== t.moves[2]
    ) {
      this._totalTokens = t;
      this.setAutoWant();
    }
    this._totalTokens = { ...t };
  }

  @Input() set updateWantToken(s: Subject<boolean>) {
    this.subs.add(s.subscribe(this.setAutoWant.bind(this)));
  }

  @Input() unusedTokens: Tokens = {
    moves: [0, 0, 0],
    shots: 0,
    maneuvers: [0, 0, 0, 0],
  };

  @Input() wantMove = 2;
  @Output() wantMoveChange = new EventEmitter<number>();

  auto = true;
  private subs = new Subscription();

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  drag(move: number): void {
    this.dragContext.move = move;
    this.dragContext.source = 8;
  }

  changeWantMove(): void {
    if (this.auto) this.setAutoWant();
    else this.wantMoveChange.emit(this.wantMove);
  }

  private setAutoWant(forceAuto = false) {
    if (forceAuto) this.auto = true;
    if (!this.auto) return;
    let min = 255;
    for (const move of [1, 0, 2]) {
      const haveMove = this._totalTokens?.moves[move] || 0;
      if (haveMove < min) {
        min = haveMove;
        this.wantMove = move + 1;
      }
    }
    this.wantMoveChange.emit(this.wantMove);
  }
}
