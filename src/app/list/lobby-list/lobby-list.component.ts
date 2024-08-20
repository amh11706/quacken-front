import { Component, Input, OnInit, OnDestroy, Injector } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { StatService } from '../../esc-menu/profile/stat.service';
import { InCmd, OutCmd } from '../../ws/ws-messages';
import { WsService } from '../../ws/ws.service';
import { EscMenuService } from '../../esc-menu/esc-menu.service';
import { CreateComponent } from '../create/create.component';
import { NewsComponent } from '../news/news.component';
import { Note, Notes } from '../news/notes';
import { Competitions } from '../competition/competition';
import { CompetitionComponent } from '../competition/competition.component';
import { Message } from '../../chat/types';
import { ListLobby } from '../../lobby/cadegoose/types';

@Component({
  selector: 'q-lobby-list',
  templateUrl: './lobby-list.component.html',
  styleUrls: ['./lobby-list.component.scss'],
})
export class LobbyListComponent implements OnInit, OnDestroy {
  lobbies = new BehaviorSubject<ListLobby[]>([]);
  note = Notes[0] as Note;
  private sub = new Subscription();
  @Input() message: Message = {} as Message;
  competitions = Competitions;

  constructor(
    public stat: StatService,
    public ws: WsService,
    private dialog: MatDialog,
    public es: EscMenuService,
    private injector: Injector,
  ) { }

  ngOnInit(): void {
    this.sub.add(this.ws.subscribe(InCmd.LobbyList, lobbies => {
      this.lobbies.next(lobbies);
    }));
    this.sub.add(this.ws.subscribe(InCmd.LobbyUpdate, update => {
      const lobbies = this.lobbies.getValue();
      for (let i = 0; i < lobbies.length; i++) {
        const lobby = lobbies[i];
        if (!lobby) continue;
        if (update.id === lobby.id) {
          lobbies[i] = update;
          this.lobbies.next(lobbies);
          return;
        }
      }
      lobbies.push(update);
      this.lobbies.next(lobbies);
    }));
    this.sub.add(this.ws.subscribe(InCmd.LobbyRemove, id => {
      this.lobbies.next(this.lobbies.getValue().filter(l => l.id !== id));
    }));
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (!v) return;
      this.ws.send(OutCmd.LobbyListJoin);
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  openLeaders(): void {
    void this.stat.openLeaders(199);
  }

  openUserMatches(): void {
    this.stat.openUserMatches();
  }

  openQueue(): void {
    void this.es.openTab(4);
  }

  join(l: ListLobby, e: MouseEvent): void {
    if (l.group.publicMode?.value && !e.ctrlKey) {
      e.preventDefault();
      this.ws.send(OutCmd.LobbyApply, l.id);
    }
  }

  trackByLobbyId(_: number, l: ListLobby): number {
    return l.id;
  }

  createLobby(): void {
    this.dialog.open(CreateComponent, { maxHeight: '90vh', injector: this.injector });
  }

  openCompetitions(): void {
    this.dialog.open(CompetitionComponent, { maxHeight: '90vh', injector: this.injector });
  }

  openNews(): void {
    this.dialog.open(NewsComponent, { maxHeight: '90vh', injector: this.injector });
  }
}
