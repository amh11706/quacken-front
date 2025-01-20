import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private hasPermission = false;

  async getPermission() {
    const result = await window.Notification.requestPermission();
    this.hasPermission = result === 'granted';
    return result;
  }

  notify(title: string, options?: NotificationOptions) {
    if (!this.hasPermission) return;
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      n.close();
    };
  }

  async test() {
    await this.getPermission();
    this.notify('Quacken Test', { body: 'If you can see this, your notifications are working!' });
  }
}
