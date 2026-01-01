import { Injectable, inject } from '@angular/core';
import { Router, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private router = inject(Router);

  static triedPath = '';

  canActivate(_: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = window.localStorage.getItem('token');
    if (!token) {
      AuthGuard.triedPath = state.url || '';
      void this.router.navigateByUrl('/auth/login');
      return false;
    }
    return true;
  }
}
