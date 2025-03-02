import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'q-message',
    templateUrl: './message.component.html',
    styleUrls: ['./message.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class MessageComponent {
  constructor(
    public dialogRef: MatDialogRef<MessageComponent>,
    @Inject(MAT_DIALOG_DATA) public message = '',
  ) { }
}
