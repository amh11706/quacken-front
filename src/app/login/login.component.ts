import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

import { TermsComponent } from './terms/terms.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { AuthGuard } from '../auth.guard';

@Component({
  selector: 'q-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  @ViewChild('error', { static: false }) errComponent?: TemplateRef<HTMLElement>;

  user = {
    email: '',
    password: ''
  };
  pending = false;
  errMessage = '';

  private path = location.port === '4200' ? 'https://dev.superquacken.com/' : '/';

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private router: Router,
    private guard: AuthGuard,
  ) {
    const token = localStorage.getItem('token');
    if (token) {
      router.navigate(['list']);
    }
  }

  ngOnInit() {
  }

  login() {
    this.pending = true;
    this.http.post<any>(this.path + 'login', JSON.stringify(this.user))
      .subscribe(
        resp => {
          this.pending = false;
          localStorage.setItem('token', resp);
          this.router.navigate([this.guard.triedPath || 'list']);
          this.guard.triedPath = '';
        },
        () => {
          this.pending = false;
          if (this.errComponent) this.dialog.open(this.errComponent);
        },
      );
  }

  createAccount() {
    this.router.navigate(['create']);
  }

  guestLogin() {
    localStorage.setItem('token', 'guest');
    this.router.navigate([this.guard.triedPath || 'list']);
    this.guard.triedPath = '';
  }

  showTerms() {
    this.dialog.open(TermsComponent);
  }

  showPrivacy() {
    this.dialog.open(PrivacyComponent);
  }

  sendReset() {
    this.pending = true;
    this.errMessage = 'Sending reset link...';
    this.http.post<any>(this.path + 'forgot', JSON.stringify(this.user.email))
      .subscribe(
        () => {
          this.pending = false;
          this.errMessage = 'Reset link sent! Check your email.';
        },
        err => {
          this.pending = false;
          this.errMessage = err.error;
        },
      );
  }

}
