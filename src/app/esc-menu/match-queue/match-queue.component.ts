/* eslint-disable @angular-eslint/use-lifecycle-interface */
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSliderModule } from '@angular/material/slider';
import { FormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { MainMenuService } from '../../lobby/cadegoose/main-menu/main-menu.service';
import { FriendsService } from '../../chat/friends/friends.service';
import { KeyBindingService } from '../../settings/key-binding/key-binding.service';
import { SettingsService } from '../../settings/settings.service';
import { WsService } from '../../ws/ws.service';
import { EscMenuService } from '../esc-menu.service';
import { SettingsModule } from '../../settings/settings.module';

@Component({
  selector: 'q-match-queue',
  standalone: true,
  imports: [MatButtonModule, CommonModule, MatSliderModule, FormsModule, SettingsModule],
  templateUrl: './match-queue.component.html',
  styleUrls: ['./match-queue.component.scss'],
  providers: [MainMenuService],
})
export class MatchQueueComponent implements OnInit {
  players: { name: string, username: string }[] = []; // Initially empty

  // Form controls for sliders
  minTurnTime = new FormControl(20); // Default value for minTurnTime
  maxTurnTime = new FormControl(35); // Default value for maxTurnTime

  subscriptions: Subscription[] = [];
  private matchSettings = this.ss.prefetch('matchmaking');

  constructor(
    public ws: WsService,
    private ss: SettingsService,
    private fs: FriendsService,
    private kbs: KeyBindingService,
    private es: EscMenuService,
  ) { void ss.getGroup('matchmaking'); }

  ngOnInit() {
    // Subscribe to settings value changes using SettingsService
    this.subscriptions.push(
      this.matchSettings.minTurnTime.userStream.subscribe((value) => {
        if (value > this.matchSettings.maxTurnTime.value) {
          this.matchSettings.maxTurnTime.value = (value);
        }
      }));

    this.subscriptions.push(
      this.matchSettings.maxTurnTime.userStream.subscribe((value) => {
        if (value < this.matchSettings.minTurnTime.value) {
          this.matchSettings.minTurnTime.value = (value);
        }
      }));
  }

  ngOnDestroy() {
    // Unsubscribe to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  joinQueue(): void {
    const username = this.ws.getUsername(); // Get the username from WsService
    if (!this.players.find(player => player.username === username)) {
      const newPlayer = { name: `Player ${this.players.length + 1}`, username };
      this.players.push(newPlayer);
    } else {
      console.warn(`User ${username} is already in the queue.`);
    }
  }

  leaveQueue(username: string): void {
    this.players = this.players.filter(player => player.username !== username);
  }
}
