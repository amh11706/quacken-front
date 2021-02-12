import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { OutCmd } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';
import { MessageComponent } from './message/message.component';
import { Router } from '@angular/router';

@Component({
  selector: 'q-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class AccountComponent implements OnInit {
  pending = false;

  constructor(
    private ws: WsService,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  async changePass(newPass: string, password: string) {
    this.pending = true;
    const res = await this.ws.request(OutCmd.ChangePass, { newPassword: newPass, password });
    this.pending = false;
    const message = res === 'Success' ? 'Password changed!' : res;
    this.dialog.open(MessageComponent, { data: message });
  }

  async changeName(name: string, password: string) {
    this.pending = true;
    const res = await this.ws.request(OutCmd.ChangeName, { name, password });
    this.pending = false;
    const message = res === 'Success' ? 'Name changed! This will take effect next time you log in.' : res;
    if (res === 'Success') localStorage.removeItem('token');
    this.dialog.open(MessageComponent, { data: message });
  }

  async changeEmail(email: string, password: string) {
    this.pending = true;
    const res = await this.ws.request(OutCmd.ChangeEmail, { email, password });
    this.pending = false;
    const message = res === 'Success' ? 'Email changed!' : res;
    this.dialog.open(MessageComponent, { data: message });
  }

  async delete(password: string) {
    this.pending = true;
    const res = await this.ws.request(OutCmd.ChangeEmail, { email: '', password });
    this.pending = false;
    if (res === 'Success') {
      this.ws.close();
      localStorage.removeItem('token');
      await this.router.navigate(['auth/login']);
    }
    const message = res === 'Success' ? 'Account deleted.' : res;
    this.dialog.open(MessageComponent, { data: message });
  }

}
