import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog } from '@angular/material';

import { TermsComponent } from '../terms/terms.component';
import { PrivacyComponent } from '../privacy/privacy.component';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css']
})
export class CreateComponent implements OnInit {
  @ViewChild('error') errComponent;
  err: string;

  user = {
    email: '',
    password: '',
    name: ''
  }
  pending = false;

  private path = location.port === '4200' ? 'https://localhost/' : '/';

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

  ngOnInit() {
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
        this.dialog.open(this.errComponent);
      },
    );
  }

  back() {
    this.router.navigate(['login']);
  }

  showTerms() {
    this.dialog.open(TermsComponent);
  }

  showPrivacy() {
    this.dialog.open(PrivacyComponent);
  }

}
