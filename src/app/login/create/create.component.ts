import { Component, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { TermsComponent } from '../terms/terms.component';
import { PrivacyComponent } from '../privacy/privacy.component';

@Component({
  selector: 'q-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
  standalone: false,
})
export class CreateComponent {
  @ViewChild('error', { static: false }) errComponent?: TemplateRef<HTMLElement>;
  err = '';

  user = {
    email: '',
    password: '',
    name: '',
  };

  pending = false;

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

  create(): void {
    this.pending = true;
    this.http.post<string>(this.path + 'create', JSON.stringify(this.user))
      .subscribe(
        {
          next: resp => {
            window.localStorage.setItem('token', resp);
            void this.router.navigate(['list']);
          },
          error: (err: unknown) => {
            this.pending = false;
            if (!(err instanceof HttpErrorResponse)) return;
            this.err = typeof err.error === 'string' ? err.error : 'Server error. Please try again later.';
            if (this.errComponent) this.dialog.open(this.errComponent);
          },
        },
      );
  }

  back(): void {
    void this.router.navigate(['auth/login']);
  }

  showTerms(): void {
    this.dialog.open(TermsComponent);
  }

  showPrivacy(): void {
    this.dialog.open(PrivacyComponent);
  }
}
