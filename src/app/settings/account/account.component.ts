import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EmojiData, EmojiEvent } from '@ctrl/ngx-emoji-mart/ngx-emoji';
import { WsService } from '../../ws/ws.service';
import { OutCmd } from '../../ws/ws-messages';
import { MessageComponent } from './message/message.component';

export const CustomEmojis: Partial<EmojiData>[] = [
  {
    name: 'FrogSuss',
    shortName: 'frogsuss',
    shortNames: ['frogsuss'],
    text: '',
    emoticons: [],
    keywords: ['frog', 'suss', 'frogsuss'],
    imageUrl: '/assets/icons/frog.png',
  },
  {
    name: 'This is fine',
    shortName: 'thisisfine',
    shortNames: ['thisisfine'],
    text: '',
    emoticons: [],
    keywords: ['this', 'fine', 'fire'],
    imageUrl: '/assets/icons/thisisfine.gif',
  },
];

export function FindCustomEmoji(name: string): EmojiData | string {
  return CustomEmojis.find(e => e.colons === name) as EmojiData || name;
}

@Component({
  selector: 'q-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class AccountComponent {
  pending = false;
  logged = 0;
  customEmojis = CustomEmojis;
  findCustomEmoji = FindCustomEmoji;

  constructor(
    public ws: WsService,
    private dialog: MatDialog,
    private router: Router,
  ) { }

  emojiPicked(e: EmojiEvent): void {
    let name = e.emoji.colons || e.emoji.shortName;
    // crown is reserved for competition winners
    if (name === ':crown:') name = ':hankey:';
    this.ws.user.d = name;
    this.ws.send(OutCmd.SetUserEmoji, name);
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
    const message = res === 'Success' ? 'Name changed! This will take full effect next time you log in.' : res || 'Error';
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
