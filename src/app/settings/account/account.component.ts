import { Component } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { WsService } from '../../ws.service';
import { OutCmd } from '../../ws-messages';
import { MessageComponent } from './message/message.component';

@Component({
  selector: 'q-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent {
  pending = false;

  constructor(
    private ws: WsService,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  async changePass(newPass: string, password: string): Promise<void> {
    this.pending = true;
    const res = await this.ws.request(OutCmd.ChangePass, { newPassword: newPass, password });
    this.pending = false;
    const message = res === 'Success' ? 'Password changed!' : res;
    this.dialog.open(MessageComponent, { data: message });
  }

  async changeName(name: string, password: string): Promise<void> {
    this.pending = true;
    const res = await this.ws.request(OutCmd.ChangeName, { name, password });
    this.pending = false;
    const message = res === 'Success' ? 'Name changed! This will take effect next time you log in.' : res;
    if (res === 'Success') window.localStorage.removeItem('token');
    this.dialog.open(MessageComponent, { data: message });
  }

  async changeEmail(email: string, password: string): Promise<void> {
    this.pending = true;
    const res = await this.ws.request(OutCmd.ChangeEmail, { email, password });
    this.pending = false;
    const message = res === 'Success' ? 'Email changed!' : res;
    this.dialog.open(MessageComponent, { data: message });
  }

  async delete(password: string): Promise<void> {
    this.pending = true;
    const res = await this.ws.request(OutCmd.ChangeEmail, { email: '', password });
    this.pending = false;
    if (res === 'Success') {
      this.ws.close();
      window.localStorage.removeItem('token');
      await this.router.navigate(['auth/login']);
    }
    const message = res === 'Success' ? 'Account deleted.' : res;
    this.dialog.open(MessageComponent, { data: message });
  }
}
