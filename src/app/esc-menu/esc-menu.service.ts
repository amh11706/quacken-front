import { Injectable } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Params, Router } from '@angular/router';
import { BehaviorSubject, Observable, distinctUntilChanged, filter, map, switchMap, tap } from 'rxjs';
import { KeyActions } from '../settings/key-binding/key-actions';
import { KeyBindingService } from '../settings/key-binding/key-binding.service';
import { WsService } from '../ws/ws.service';

@Injectable({
  providedIn: 'root',
})
export class EscMenuService {
  queryParams$: Observable<Params>;
  private _open$ = new BehaviorSubject(false);
  private _activeTab$ = new BehaviorSubject(0);
  private _lobbyTab$ = new BehaviorSubject(0);
  open$ = this._open$.asObservable();
  activeTab$ = this._activeTab$.asObservable();
  lobbyTab$ = this._lobbyTab$.asObservable();

  lobbyComponent: any;
  lobbyContext: any;

  constructor(
    private ws: WsService,
    private router: Router,
    private route: ActivatedRoute,
    kbs: KeyBindingService,
  ) {
    this.queryParams$ = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      tap(() => {
        this.route = this.router.routerState.root.firstChild || this.route;
      }),
      switchMap(() => this.route.queryParams),
    );

    this.queryParams$.pipe(
      filter(p => p.tab !== undefined),
      map(p => +p.tab),
      distinctUntilChanged(),
    ).subscribe(v => {
      this._activeTab$.next(v);
    });

    this.queryParams$.pipe(
      map(p => p.esc === 'true'),
      distinctUntilChanged(),
    ).subscribe(v => {
      this._open$.next(v);
    });

    this.queryParams$.pipe(
      filter(p => p.lobbyTab !== undefined),
      map(p => +p.lobbyTab),
      distinctUntilChanged(),
    ).subscribe(v => {
      this._lobbyTab$.next(v);
    });

    kbs.subscribe(KeyActions.ToggleEscMenu, v => {
      if (v) void this.toggle();
    });
    kbs.subscribe(KeyActions.OpenLobby, v => {
      if (v) void this.openTab(0, true);
    });
    kbs.subscribe(KeyActions.OpenSettings, v => {
      if (v) void this.openTab(3, true);
    });
    kbs.subscribe(KeyActions.OpenInventory, v => {
      if (v) void this.openTab(2, true);
    });
    kbs.subscribe(KeyActions.OpenProfile, v => {
      if (v) void this.openTab(1, true);
    });
    kbs.subscribe(KeyActions.LeaveLobby, v => {
      if (v && (this.lobbyComponent || this.lobbyContext)) void this.leave();
    });
    kbs.subscribe(KeyActions.Logout, v => {
      if (v) void this.logout();
    });
  }

  tabChange(index: number, toggle = false, queryExtra: Record<string, number> = {}) {
    if (!this._open$.value) return;
    return this.openTab(index, toggle, queryExtra);
  }

  openTab(tab: number, toggle = false, queryExtra: Record<string, number> = {}): Promise<any> {
    if (toggle && tab === this._activeTab$.value) return this.openMenu(false);
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { esc: 'true', tab, lobbyTab: null, ...queryExtra },
      queryParamsHandling: 'merge',
    });
  }

  openMenu(value = true) {
    return this.router.navigate([], {
      relativeTo: this.route,
      queryParams: value ? { esc: 'true', tab: 0, lobbyTab: 0 } : { esc: null, tab: null, lobbyTab: null, profileTab: null },
      queryParamsHandling: 'merge',
    });
  }

  toggle() {
    return this.openMenu(!this._open$.value);
  }

  setLobby(component?: unknown, context?: unknown): void {
    this.lobbyComponent = component;
    this.lobbyContext = context;
  }

  private logout() {
    this.ws.close();
    window.localStorage.removeItem('token');
    return this.router.navigate(['auth/login']);
  }

  private leave() {
    return this.router.navigate(['list']);
  }
}
