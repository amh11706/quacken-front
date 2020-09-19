import { Component, OnInit, ViewChild, OnDestroy, ElementRef, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'q-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent implements OnInit, OnDestroy {
  @ViewChild('error', { static: false }) errComponent?: TemplateRef<HTMLElement>;
  private path = location.port === '4200' ? 'https://dev.superquacken.com/' : '/';
  private token = '';
  private sub = new Subscription();

  password = '';
  cPassword = '';
  pending = false;
  err = '';

  constructor(
    private route: ActivatedRoute,
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
    this.sub.add(this.route.paramMap.subscribe(params => {
      this.token = params.get('token') || '';
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  reset() {
    if (this.password !== this.cPassword) {
      this.err = 'Passwords do not match!';
      if (this.errComponent) this.dialog.open(this.errComponent);
      return;
    }

    this.pending = true;
    this.http.post<any>(this.path + 'reset', JSON.stringify({
      password: this.password, token: this.token,
    })).subscribe(
      () => {
        this.pending = false;
        this.back();
      },
      err => {
        this.pending = false;
        this.err = err.error;
        if (this.errComponent) this.dialog.open(this.errComponent);
      },
    );
  }

  back() {
    this.router.navigate(['login']);
  }


}
