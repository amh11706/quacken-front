import { Component, OnInit } from '@angular/core';

export interface Friend {
  name: string,
  status?: number,
  message?: string,
  inLobby?: number,
  lastSeen?: number,
}

@Component({
  selector: 'app-friends',
  templateUrl: './friends.component.html',
  styleUrls: ['./friends.component.css']
})
export class FriendsComponent implements OnInit {
  selected = 'friend';
  links = [
    { title: 'Friends', path: 'friend' },
    { title: 'Blocked', path: 'block' },
    { title: 'Invites', path: 'invite' },
  ];

  friends: Friend[] = [
    { name: 'first', status: 1, message: 'test', inLobby: 1 },
    { name: 'second' },
    { name: 'third' },
    { name: 'fourth' },
    { name: 'first' },
    { name: 'second' },
    { name: 'third' },
    { name: 'fourth' },
    { name: 'first' },
    { name: 'second' },
    { name: 'third' },
  ];
  offline: Friend[] = [
    { name: 'fourth' },
  ];

  constructor() { }

  ngOnInit() {
  }

}
