import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

import { WsService } from './ws.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  triedPath = '';

  constructor(private router: Router, private socket: WsService) { }

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      this.triedPath = state.url;
      this.router.navigateByUrl('/auth/login');
      return false;
    }
    if (!this.socket.connected) this.socket.connect(token);
    return true;
  }
}
