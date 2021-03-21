import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { InMessage, WsService } from 'src/app/ws.service';
import { InCmd, Internal } from 'src/app/ws-messages';
import { Turn } from 'src/app/lobby/quacken/boats/boats.component';
import { Message } from 'src/app/chat/chat.service';
import { Boat } from 'src/app/lobby/quacken/boats/boat';
import { Subscription } from 'rxjs';
import { BoatTick } from 'src/app/lobby/quacken/hud/hud.component';
import { BoatRender } from 'src/app/lobby/cadegoose/boat-render';

interface ParsedTurn {
  turn: number;
  index: number;
  teams: {
    score: number;
    scoreChange: number;
    sinks: Message[];
  }[];
}

@Component({
  selector: 'q-replay-cadegoose',
  templateUrl: './cadegoose.component.html',
  styleUrls: ['./cadegoose.component.scss']
})
export class CadegooseComponent implements OnInit, OnDestroy {
  @ViewChild('turnTab', { static: true, read: ElementRef }) turnTab?: ElementRef<HTMLElement>;
  @Output() playTo = new EventEmitter<number>();
  @Input() set tick(value: number) {
    const i = Math.floor((value + 2) / 30) - 1;
    this.activeTurn = this.turns[i];
    const buttons = this.turnTab?.nativeElement.children;
    buttons?.[i >= 0 ? i : 0]?.scrollIntoView({ block: 'center' });
  }
  @Input() set messages(messages: InMessage[][]) {
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
  tabIndex = 1;
  turns: ParsedTurn[] = [];
  maxScore = 0;
  activeTurn?: ParsedTurn;

  boats: Boat[] = [];
  boatTicks: Record<number, BoatTick> = {};
  activeBoat?: Boat;

  private subs = new Subscription();

  constructor(private ws: WsService) { }

  ngOnInit(): void {
    this.subs.add(this.ws.fakeWs?.subscribe(Internal.Boats, (boats: Boat[]) => {
      this.boats = [...boats].sort((a, b) => {
        if (a.name > b.name) return 1;
        return -1;
      });
    }));
    this.subs.add(this.ws.fakeWs?.subscribe(Internal.BoatClicked, (boat: Boat) => {
      this.clickBoat(boat);
    }));
    this.subs.add(this.ws.fakeWs?.subscribe(InCmd.BoatTicks, (ticks: Record<number, BoatTick>) => {
      this.boatTicks = ticks;
      this.updateBoat();
    }));
    this.subs.add(this.ws.fakeWs?.subscribe(InCmd.Moves, moves => {
      if (this.activeBoat?.id === moves.t) this.updateBoat();
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
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
    setTimeout(() => this.ws.fakeWs?.dispatchMessage({ cmd: Internal.CenterOnBoat }));
  }

  hoverBoat(boat: Boat, enter = true) {
    boat.render?.showInfluence(enter);
  }

  clickBoat(boat: Boat) {
    if (this.activeBoat === boat) {
      this.ws.fakeWs?.dispatchMessage({ cmd: Internal.CenterOnBoat });
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
    this.ws.fakeWs?.dispatchMessage({ cmd: Internal.CenterOnBoat });
    if (this.boatTicks[boat.id]) this.updateBoat();
  }

}
