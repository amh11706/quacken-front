import { Component, Input, Output, EventEmitter, TemplateRef, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';
import { NotActive } from '../key-actions';
import { KeyBindingEditMode } from '../key-binding.component';
import { KeyBindingService } from '../key-binding.service';

@Component({
  selector: 'q-binder',
  templateUrl: './binder.component.html',
  styleUrls: ['./binder.component.scss']
})
export class BinderComponent implements OnDestroy {
  private _binding?: KeyBindingEditMode;
  @Input() set binding(b: KeyBindingEditMode) {
    this._binding = b;
    this.key = b.bindings[this.index];
    this.changed = this.key !== b.activeBindings[this.index];
    this.notDefault = this.key !== b.defaultBindings[this.index];
    this.title = '';
    if (this.changed) this.title = 'Active: ' + b.activeBindings[this.index];
    if (this.notDefault) {
      if (this.title) this.title += ' ';
      this.title += 'Default: ' + b.defaultBindings[this.index];
    }

    this.sub?.unsubscribe();
    this.sub = b.update.subscribe(() => { if (this._binding) this.binding = this._binding; });
  }
  @Input() index = 0;
  @Input() disabled = false;
  @Input() takenKeys?: Map<string, KeyBindingEditMode[]>;
  @Output() keyChange = new EventEmitter<void>();
  NotActive = NotActive;

  key = '';
  title = '';
  changed = false;
  notDefault = false;
  newKey = '';
  conflict?: KeyBindingEditMode[];
  private sub?: Subscription;

  constructor(private dialog: MatDialog, private kbs: KeyBindingService) { }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  openDialog(ref: TemplateRef<any>) {
    this.newKey = this.key;
    const sub = this.kbs.bindSubscribe(e => {
      this.newKey = e;
      this.conflict = this.takenKeys?.get(e);
      if (this.conflict?.[0] === this._binding) delete this.conflict;
    });

    const dialog = this.dialog.open(ref, { disableClose: true, width: '300px', maxWidth: '100%' });
    dialog.backdropClick().subscribe(() => {
      dialog.close();
    });
    dialog.afterClosed().subscribe(async (key: string) => {
      if (key && this._binding) {
        if (this.conflict) {
          for (const binding of this.conflict) {
            binding.bindings = binding.bindings.map(el => el === key ? NotActive : el) as [string, string];
          }
        }
        this.takenKeys?.delete(this.key);
        this.takenKeys?.set(key, [this._binding]);

        this._binding.bindings[this.index] = key;
        this.binding = this._binding;
        this.keyChange.emit();
      }
      delete this.conflict;
      sub.unsubscribe();
    });
  }

}
