import { Component, Input, OnInit, Output, EventEmitter, TemplateRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { KeyBindingService } from '../key-binding.service';

@Component({
  selector: 'q-binder',
  templateUrl: './binder.component.html',
  styleUrls: ['./binder.component.scss']
})
export class BinderComponent implements OnInit {
  @Input() key = '';
  @Output() keyChange = new EventEmitter<string>();

  newKey = '';

  constructor(private dialog: MatDialog, private kbs: KeyBindingService) { }

  ngOnInit(): void {
  }

  openDialog(ref: TemplateRef<any>) {
    this.newKey = this.key;
    const sub = this.kbs.bindSubscribe(e => {
      this.newKey = e;
    });

    const dialog = this.dialog.open(ref, { disableClose: true });
    dialog.backdropClick().subscribe(() => {
      dialog.close();
    });
    dialog.afterClosed().subscribe((key: string) => {
      if (key) {
        this.key = key;
        this.keyChange.emit(key);
      }
      sub.unsubscribe();
    });
  }

}
