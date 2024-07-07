import { Component } from '@angular/core';
import { TwodRenderComponent } from '../twod-render/twod-render.component';

@Component({
  selector: 'q-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss'],
})
export class CanvasComponent extends TwodRenderComponent {
  protected drawRocks = true;

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method, @angular-eslint/use-lifecycle-interface
  ngOnInit(): void {
    // override super onInit because this is just a preview
  }
}
