import { Component, OnInit } from '@angular/core';
import { TwodRenderComponent } from '../twod-render/twod-render.component';

@Component({
  selector: 'q-canvas',
  templateUrl: './canvas.component.html',
  styleUrl: './canvas.component.scss',
  standalone: false,
})
export class CanvasComponent extends TwodRenderComponent implements OnInit {
  protected override drawRocks = true;

  // eslint-disable-next-line @angular-eslint/no-empty-lifecycle-method
  override ngOnInit(): void {
    // override super onInit because this is just a preview
  }
}
