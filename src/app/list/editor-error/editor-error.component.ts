import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'q-editor-error',
  templateUrl: './editor-error.component.html',
  styleUrl: './editor-error.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class EditorErrorComponent {
}
