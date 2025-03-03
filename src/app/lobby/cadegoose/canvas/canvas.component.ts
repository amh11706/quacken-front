import { Component } from '@angular/core';
import { TwodRenderComponent } from '../twod-render/twod-render.component';

@Component({
  selector: 'q-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
  standalone: false,
})
export class CanvasComponent extends TwodRenderComponent {
  protected drawRocks = true;

  ngOnInit(): void {
    // override super onInit because this is just a preview
  }
}
