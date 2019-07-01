import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { WsService } from './ws.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(public ws: WsService, public router: Router) { }

  logout() {
    this.ws.close();
    localStorage.removeItem('token');
    this.router.navigate(['login']);
  }
}
