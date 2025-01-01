import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LobbyService<T> {
  lobby = new BehaviorSubject<T>({} as T);

  get() {
    return this.lobby;
  }
}
