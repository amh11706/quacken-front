import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { KeyActions } from '../../settings/key-binding/key-actions';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { ChatService } from '../chat.service';
import { CustomEmojis, FindCustomEmoji } from '../../settings/account/account.component';

@Component({
  selector: 'q-input',
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class InputComponent implements OnInit, OnDestroy {
  customEmojis = CustomEmojis;
  findCustomEmoji = FindCustomEmoji;

  @Input() disabled = false;
  private subs = new Subscription();

  constructor(
    public chat: ChatService,
    private kbs: KeyBindingService,
  ) { }

  ngOnInit(): void {
    this.subs.add(this.kbs.subscribe(KeyActions.FocusChat, v => {
      if (v && !this.disabled) {
        this.focusChat();
      }
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  handleKey(e: KeyboardEvent): void {
    const param = this.chat.selectedCommand$.getValue().params.find(p => p.name === 'message');
    if (e.key === 'Enter') {
      this.sendInput(e);
    } else if (e.key === 'ArrowUp') {
      const history = this.chat.commandHistory;
      if (this.chat.historyIndex === 0 || history.length === 0 || !param) return;

      if (this.chat.historyIndex > 0) this.chat.historyIndex--;
      else {
        this.chat.historyIndex = history.length - 1;
        this.chat.saveText = param.value;
      }
      param.value = history[this.chat.historyIndex] ?? param.value;
    } else if (e.key === 'ArrowDown') {
      if (this.chat.historyIndex === -1 || !param) return;
      const history = this.chat.commandHistory;
      if (this.chat.historyIndex === history.length - 1) {
        this.chat.historyIndex = -1;
        param.value = this.chat.saveText;
        return;
      }

      this.chat.historyIndex++;
      param.value = history[this.chat.historyIndex] ?? param.value;
    } else if (e.key === 'Escape') {
      this.blurChat();
    }
  }

  focusChat(): void {
    setTimeout(() => {
      document.getElementById('message')?.focus();
    });
  }

  blurChat(): void {
    setTimeout(() => document.getElementById('message')?.blur());
  }

  sendInput(e: Event): void {
    e.preventDefault();
    const selectedCommand = this.chat.selectedCommand$.getValue();
    let text = selectedCommand.base;
    for (const param of selectedCommand.params) {
      if (!param.name) continue;
      const value = param.value;
      if (param.name === 'message') {
        if (!value) return this.blurChat();
        param.value = '';
      }
      if (value[0] === '/') {
        text = value;
        break;
      }
      text += ' ' + value;
    }
    this.chat.historyIndex = -1;
    this.chat.sendCommand(text);

    const firstSpace = text.indexOf(' ');
    const secondSpace = text.indexOf(' ', firstSpace + 1);
    const cmdSplit = text.substr(0, firstSpace) === '/tell' ? secondSpace : firstSpace;
    const command = cmdSplit > 0 ? text.substr(0, cmdSplit + 1) : text;
    this.chat.commandHistory = this.chat.commandHistory.filter(entry => entry !== command);
    this.chat.commandHistory.push(command);
  }
}
