import { HttpClient } from '@angular/common/http';
import { Component, OnInit, TemplateRef, ViewChild, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'q-restore',
  templateUrl: './restore.component.html',
  styleUrls: ['./restore.component.scss']
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
    const token = localStorage.getItem('token');
    if (token) {
      router.navigate(['list']);
    }
  }

  ngOnInit() {
    this.sub.add(this.route.paramMap.subscribe(params => {
      this.user.token = params.get('token') || '';
    }));
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  reset() {
    this.pending = true;
    this.http.post<any>(this.path + 'restore', JSON.stringify(this.user)).subscribe(
      () => {
        this.pending = false;
        this.back();
        this.err = 'Account restored. You can now log in with the email address you provided.';
        if (this.errComponent) this.dialog.open(this.errComponent);
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

}
