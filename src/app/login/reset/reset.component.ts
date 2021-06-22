import { Component, OnInit, ViewChild, OnDestroy, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'q-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss'],
})
export class ResetComponent implements OnInit, OnDestroy {
  @ViewChild('error', { static: false }) errComponent?: TemplateRef<HTMLElement>;
  private path = environment.api;
  private token = '';
  private sub = new Subscription();

  password = '';
  pending = false;
  err = '';

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private http: HttpClient,
    private router: Router,
  ) {
    const token = window.localStorage.getItem('token');
    if (token) {
      router.navigate(['list']);
    }
  }

  ngOnInit(): void {
    this.sub.add(this.route.paramMap.subscribe(params => {
      this.token = params.get('token') || '';
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  reset(): void {
    this.pending = true;
    this.http.post<any>(this.path + 'reset', JSON.stringify({
      password: this.password, token: this.token,
    })).subscribe(
      () => {
        this.pending = false;
        this.back();
      },
      (err: unknown) => {
        this.pending = false;
        if (!(err instanceof HttpErrorResponse)) return;
        this.err = err.error;
        if (this.errComponent) this.dialog.open(this.errComponent);
      },
    );
  }

  back(): void {
    this.router.navigate(['auth/login']);
  }
}
