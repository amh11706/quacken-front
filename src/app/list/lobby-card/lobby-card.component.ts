import { Component, Input, OnInit } from '@angular/core';
import { Descriptions } from '../create/create.component';
import { Lobby } from '../../lobby/lobby.component';

@Component({
  selector: 'q-lobby-card',
  templateUrl: './lobby-card.component.html',
  styleUrls: ['./lobby-card.component.scss']
})
export class LobbyCardComponent implements OnInit {
  @Input() lobby = {} as Lobby;
  publicModes = ['Public', 'Public Invitation'];
  descriptions = Descriptions;

  constructor() { }

  ngOnInit(): void {
  }

}
