import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';

@Component({
    selector: 'q-restore',
    templateUrl: './restore.component.html',
    styleUrls: ['./restore.component.scss'],
    standalone: false
})
export class RestoreComponent implements OnInit, OnDestroy {
  @ViewChild('error', { static: false }) errComponent?: TemplateRef<HTMLElement>;
  private path = environment.api;
  private sub = new Subscription();

  user = { token: '', password: '', email: '' };
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
      void router.navigate(['list']);
    }
  }

  ngOnInit(): void {
    this.sub.add(this.route.paramMap.subscribe(params => {
      this.user.token = params.get('token') || '';
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  reset(): void {
    this.pending = true;
    this.http.post<any>(this.path + 'restore', JSON.stringify(this.user)).subscribe(
      () => {
        this.back();
        this.err = 'Account restored. You can now log in with the email address you provided.';
        if (this.errComponent) this.dialog.open(this.errComponent);
      },
      (err: unknown) => {
        this.pending = false;
        if (!(err instanceof HttpErrorResponse)) return;
        this.err = typeof err.error === 'string' ? err.error : 'Server error. Try again later.';
        if (this.errComponent) this.dialog.open(this.errComponent);
      },
    );
  }

  back(): void {
    void this.router.navigate(['auth/login']);
  }
}
