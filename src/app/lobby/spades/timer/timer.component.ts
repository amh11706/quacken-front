import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'q-timer',
  templateUrl: './timer.component.html',
  styleUrls: ['./timer.component.css'],
})
export class TimerComponent {
  @Output() expire = new EventEmitter();

  percent = 0;
  seconds = 0.5;
  private timer?: number;

  go(seconds = 10): void {
    clearTimeout(this.timer);
    this.percent = 0;
    this.seconds = 0.5;
    this.timer = window.setTimeout(() => {
      this.percent = 100;
      this.seconds = seconds - 0.5;
      this.timer = window.setTimeout(() => {
        this.expire.emit();
      }, seconds * 1000 - 500);
    }, 500);
  }
}
