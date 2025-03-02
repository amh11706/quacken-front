import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, AfterViewInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthGuard } from '../../auth.guard';
import { environment } from '../../../environments/environment';
import { PrivacyComponent } from '../privacy/privacy.component';
import { TermsComponent } from '../terms/terms.component';
import { WsService } from '../../ws/ws.service';

@Component({
    selector: 'q-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
    standalone: false
})
export class LoginFormComponent implements AfterViewInit {
  @ViewChild('error', { static: false }) errComponent?: TemplateRef<HTMLElement>;
  defaultServerError = 'Server error. Try again later.';

  user = {
    email: '',
    password: '',
  };

  pending = false;
  errMessage = '';

  private path = environment.api;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private router: Router,
  ) {
    const token = window.localStorage.getItem('token');
    if (token) {
      void router.navigate(['list']);
    }
  }

  ngAfterViewInit(): void {
    if (WsService.reason) {
      this.errMessage = WsService.reason;
      delete WsService.reason;
      if (this.errComponent) this.dialog.open(this.errComponent);
    }
  }

  login(): void {
    this.pending = true;
    this.http.post<string>(this.path + 'login', JSON.stringify(this.user))
      .subscribe(
        resp => {
          window.localStorage.setItem('token', resp);
          if (!AuthGuard.triedPath) {
            void this.router.navigate(['list']);
            return;
          }

          const [path, query] = AuthGuard.triedPath.split('?');
          if (query) {
            const parsed = {} as Record<string, string>;
            new URLSearchParams(query).forEach((value, key) => {
              parsed[key] = value;
            });
            void this.router.navigate([path], { queryParams: parsed });
          } else {
            void this.router.navigate([AuthGuard.triedPath]);
          }
          AuthGuard.triedPath = '';
        },
        (err: unknown) => {
          this.pending = false;
          this.errMessage = this.getErrorMessage(err);
          if (this.errComponent) this.dialog.open(this.errComponent);
        },
      );
  }

  createAccount(): void {
    void this.router.navigate(['auth/create']);
  }

  private getErrorMessage(err: unknown): string {
    if (!(err instanceof HttpErrorResponse)) return this.defaultServerError;
    if (err.status === 403) return 'Invalid email or password';
    if (typeof err.error === 'string') return err.error;
    return this.defaultServerError;
  }

  guestLogin(): void {
    window.localStorage.setItem('token', 'guest');
    void this.router.navigate([AuthGuard.triedPath || 'list']);
    AuthGuard.triedPath = '';
  }

  showTerms(): void {
    this.dialog.open(TermsComponent);
  }

  showPrivacy(): void {
    this.dialog.open(PrivacyComponent);
  }

  sendReset(): void {
    this.pending = true;
    this.errMessage = 'Sending reset link...';
    this.http.post<any>(this.path + 'forgot', JSON.stringify(this.user.email))
      .subscribe(
        () => {
          this.pending = false;
          this.errMessage = 'Reset link sent! Check your email.';
        },
        (err: unknown) => {
          this.pending = false;
          if (err instanceof HttpErrorResponse) this.errMessage = err.error;
        },
      );
  }
}
