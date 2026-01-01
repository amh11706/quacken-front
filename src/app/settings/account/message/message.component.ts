import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'q-message',
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MessageComponent {
  dialogRef = inject<MatDialogRef<MessageComponent>>(MatDialogRef);
  message = inject(MAT_DIALOG_DATA) ?? '';
}
