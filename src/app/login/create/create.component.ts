import { Component, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';

import { TermsComponent } from '../terms/terms.component';
import { PrivacyComponent } from '../privacy/privacy.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'q-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss']
})
export class CreateComponent {
  @ViewChild('error', { static: false }) errComponent?: TemplateRef<HTMLElement>;
  err = '';

  user = {
    email: '',
    password: '',
    name: ''
  };
  pending = false;

  private path = environment.api;

  constructor(
    private dialog: MatDialog,
    private http: HttpClient,
    private router: Router,
  ) {
    const token = localStorage.getItem('token');
    if (token) {
      router.navigate(['list']);
    }
  }

  create() {
    this.pending = true;
    this.http.post<any>(this.path + 'create', JSON.stringify(this.user))
      .subscribe(
        resp => {
          this.pending = false;
          localStorage.setItem('token', resp);
          this.router.navigate(['list']);
        },
        err => {
          this.pending = false;
          this.err = err.error;
          if (this.errComponent) this.dialog.open(this.errComponent);
        },
      );
  }

  back() {
    this.router.navigate(['auth/login']);
  }

  showTerms() {
    this.dialog.open(TermsComponent);
  }

  showPrivacy() {
    this.dialog.open(PrivacyComponent);
  }

}
