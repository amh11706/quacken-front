import { Component, OnInit, ViewChild, OnDestroy, ElementRef, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'q-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
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
    this.router.navigate(['auth/login']);
  }


}
