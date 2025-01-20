import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { LobbyStatus } from './cadegoose/lobby-type';

const inPgrogressValues = new Set([LobbyStatus.MidMatch, LobbyStatus.Paused, LobbyStatus.Voting]);

@Injectable({
  providedIn: 'root',
})
export class LobbyService<T> {
  lobby = new BehaviorSubject<T>({} as T);
  status = new BehaviorSubject<LobbyStatus>(LobbyStatus.Waiting);

  get() {
    return this.lobby;
  }

  inProgress() {
    return inPgrogressValues.has(this.status.value);
  }
}
