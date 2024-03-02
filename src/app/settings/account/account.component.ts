import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { WsService } from '../../ws/ws.service';
import { OutCmd } from '../../ws/ws-messages';
import { MessageComponent } from './message/message.component';

@Component({
  selector: 'q-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountComponent {
  pending = false;
  logged = 0;

  constructor(
    public ws: WsService,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  emojiPicked(e: EmojiEvent): void {
    // crown is reserved for competition winners
    if (e.emoji.shortName === 'crown') e.emoji.shortName = 'poop';
    this.ws.user.d = e.emoji.shortName;
    this.ws.send(OutCmd.SetUserEmoji, e.emoji.shortName);
  }

  async changePass(newPass: string, password: string): Promise<void> {
    this.pending = true;
    const res = await this.ws.request(OutCmd.ChangePass, { newPassword: newPass, password });
    this.pending = false;
    const message = res === 'Success' ? 'Password changed!' : res || 'Error';
    this.dialog.open(MessageComponent, { data: message });
  }

  async changeName(name: string, password: string): Promise<void> {
    this.pending = true;
    const res = await this.ws.request(OutCmd.ChangeName, { name, password });
    this.pending = false;
    const message = res === 'Success' ? 'Name changed! This will take effect next time you log in.' : res || 'Error';
    if (res === 'Success') window.localStorage.removeItem('token');
    this.dialog.open(MessageComponent, { data: message });
  }

  async changeEmail(email: string, password: string): Promise<void> {
    this.pending = true;
    const res = await this.ws.request(OutCmd.ChangeEmail, { email, password });
    this.pending = false;
    const message = res === 'Success' ? 'Email changed!' : res || 'Error';
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
    const message = res === 'Success' ? 'Account deleted.' : res || 'Error';
    this.dialog.open(MessageComponent, { data: message });
  }
}
