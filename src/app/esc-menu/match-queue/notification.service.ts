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
    if (document.visibilityState === 'visible') return;
    if (!this.hasPermission) return;
    const n = new Notification(title, options);
    n.onclick = () => {
      window.focus();
      n.close();
    };
  }
}
