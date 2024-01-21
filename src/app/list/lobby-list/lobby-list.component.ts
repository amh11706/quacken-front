import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Message } from '../../chat/chat.service';
import { StatService } from '../../esc-menu/profile/stat.service';
import { Lobby } from '../../lobby/lobby.component';
import { InCmd, OutCmd } from '../../ws-messages';
import { WsService } from '../../ws.service';
import { EscMenuService } from '../../esc-menu/esc-menu.service';
import { CreateComponent } from '../create/create.component';
import { EditorErrorComponent } from '../editor-error/editor-error.component';
import { NewsComponent } from '../news/news.component';
import { Note, Notes } from '../news/notes';
import { Competitions } from '../competition/competition';
import { CompetitionComponent } from '../competition/competition.component';

@Component({
  selector: 'q-lobby-list',
  templateUrl: './lobby-list.component.html',
  styleUrls: ['./lobby-list.component.scss'],
})
export class LobbyListComponent implements OnInit, OnDestroy {
  lobbies: Lobby[] = [];
  note = Notes[0] as Note;
  private sub = new Subscription();
  @Input() message: Message = {} as Message;
  competitions = Competitions

  constructor(
    public stat: StatService,
    public ws: WsService,
    private dialog: MatDialog,
    private router: Router,
    public es: EscMenuService,
  ) { }

  ngOnInit(): void {
    this.sub.add(this.ws.subscribe(InCmd.LobbyList, lobbies => {
      this.lobbies = lobbies;
    }));
    this.sub.add(this.ws.subscribe(InCmd.LobbyUpdate, update => {
      for (let i = 0; i < this.lobbies.length; i++) {
        const lobby = this.lobbies[i];
        if (!lobby) continue;
        if (update.id === lobby.id) {
          Object.assign(lobby, update);
          return;
        }
      }
      this.lobbies.push(update);
    }));
    this.sub.add(this.ws.subscribe(InCmd.LobbyRemove, id => {
      this.lobbies = this.lobbies.filter(l => l.id !== id);
    }));
    this.sub.add(this.ws.connected$.subscribe(v => {
      if (!v) return;
      this.ws.send(OutCmd.LobbyListJoin);
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  openUserMatches(): void {
    this.stat.openUserMatches();
  }

  join(l: Lobby, e: MouseEvent): void {
    if (e.ctrlKey || !l.group.publicMode?.value) void this.router.navigate(['lobby', l.id]);
    else this.ws.send(OutCmd.LobbyApply, l.id);
  }

  createLobby(): void {
    this.dialog.open(CreateComponent, { maxHeight: '90vh' });
  }

  openCompetitions(): void {
    this.dialog.open(CompetitionComponent, { maxHeight: '90vh' });
  }

  openEditor(): void {
    if (this.ws.user?.id) void this.router.navigate(['editor']);
    else this.dialog.open(EditorErrorComponent);
  }

  openNews(): void {
    this.dialog.open(NewsComponent, { maxHeight: '90vh' });
  }
}
