import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { WsService } from '../ws.service';
import { Lobby } from '../lobby/lobby.component';
import { InCmd, OutCmd } from '../ws-messages';
import { MatDialog } from '@angular/material/dialog';
import { CreateComponent } from './create/create.component';
import { NewsComponent } from './news/news.component';
import { Notes } from './news/notes';
import { EditorErrorComponent } from './editor-error/editor-error.component';

@Component({
  selector: 'q-lobby-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit, OnDestroy {
  lobbies: Lobby[] = [];
  note = Notes[0];
  private sub = new Subscription();

  constructor(
    public ws: WsService,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit() {
    this.sub.add(this.ws.subscribe(InCmd.LobbyList, lobbies => {
      this.lobbies = lobbies;
    }));
    this.sub.add(this.ws.subscribe(InCmd.LobbyUpdate, update => {
      for (let i = 0; i < this.lobbies.length; i++) {
        const lobby = this.lobbies[i];
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
    this.sub.add(this.ws.connected$.subscribe(async v => {
      if (!v) return;
      this.ws.send(OutCmd.LobbyListJoin);
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  join(l: Lobby) {
    if (!l.group.publicMode) this.router.navigate(['lobby', l.id]);
    else this.ws.send(OutCmd.LobbyApply, l.id);
  }

  createLobby() {
    this.dialog.open(CreateComponent, { maxHeight: '90vh' });
  }

  openEditor() {
    if (this.ws.user?.id) this.router.navigate(['editor']);
    else this.dialog.open(EditorErrorComponent);
  }

  openNews() {
    this.dialog.open(NewsComponent, { maxHeight: '90vh' });
  }

}
