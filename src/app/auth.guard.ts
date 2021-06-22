import { Injectable } from '@angular/core';
import { Router, CanActivate, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  triedPath = '';

  constructor(private router: Router) { }

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = window.localStorage.getItem('token');
    if (!token) {
      this.triedPath = state.url;
      this.router.navigateByUrl('/auth/login');
      return false;
    }
    return true;
  }
}
