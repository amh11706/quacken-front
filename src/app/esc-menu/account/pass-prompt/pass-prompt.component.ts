import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { WsService } from 'src/app/ws.service';

@Component({
  selector: 'q-pass-prompt',
  templateUrl: './pass-prompt.component.html',
  styleUrls: ['./pass-prompt.component.scss']
})
export class PassPromptComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<PassPromptComponent>,
    @Inject(MAT_DIALOG_DATA) public message: string,
  ) { }

  ngOnInit(): void {
  }

}
