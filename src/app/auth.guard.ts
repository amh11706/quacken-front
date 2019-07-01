import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';

import { WsService } from './ws.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router, private socket: WsService) { }

  canActivate(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.router.navigate(['login'])
      return false;
    }
    if (!this.socket.connected) this.socket.connect(token);
    return true;
  }
}
