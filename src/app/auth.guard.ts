import { Injectable } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  static triedPath = '';

  constructor(private router: Router) { }

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = window.localStorage.getItem('token');
    if (!token) {
      AuthGuard.triedPath = state.url.split('?')[0] || '';
      console.log('AuthGuard: redirecting to login from ' + AuthGuard.triedPath);
      void this.router.navigateByUrl('/auth/login');
      return false;
    }
    return true;
  }
}
