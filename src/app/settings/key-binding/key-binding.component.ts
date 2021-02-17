import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SettingsService } from '../settings.service';
import { KeyBindingService } from './key-binding.service';
import { ExitPromptComponent } from './exit-prompt/exit-prompt.component';
import { KeyBindings, KeyBinding, DefaultBindings } from './key-actions';

@Component({
  selector: 'q-key-binding',
  templateUrl: './key-binding.component.html',
  styleUrls: ['./key-binding.component.scss']
})
export class KeyBindingComponent implements OnInit, OnDestroy {
  actions?: KeyBindings;
  private changedElements: HTMLCollectionOf<Element>;
  changed = false;

  constructor(
    private kbs: KeyBindingService,
    private ss: SettingsService,
    private dialog: MatDialog,
    el: ElementRef<HTMLElement>,
  ) {
    this.changedElements = el.nativeElement.getElementsByClassName('changed');
  }

  async ngOnInit() {
    this.actions = JSON.parse(JSON.stringify(this.kbs.activeBindings));
  }

  ngOnDestroy() {
    if (!this.changedElements.length) return;
    this.dialog.open(ExitPromptComponent).afterClosed().subscribe((v: boolean) => {
      if (v) this.save();
    });
  }

  updateChanged(action: KeyBinding, group: string, index: number) {
    if (!this.kbs.activeBindings) return;
    const bound = this.kbs.activeBindings[group as keyof KeyBindings][index];
    action.primaryChanged = bound.primary !== action.primary;
    action.secondaryChanged = bound.secondary !== action.secondary;

    setTimeout(() => this.changed = !!this.changedElements.length);
  }

  save() {
    if (!this.actions) return;
    this.changed = false;

    for (const k in this.actions) {
      if (!this.actions.hasOwnProperty(k)) continue;
      const set = this.actions[k as keyof KeyBindings];
      for (let i = 0; i < set.length; i++) {
        const action = set[i];
        delete action.primaryChanged;
        delete action.secondaryChanged;
      }
    }
    this.ss.save({
      id: 32, name: 'bindings', group: 'controls', value: 0,
      data: this.actions,
    });

    this.kbs.setBindings(this.actions);
    this.actions = JSON.parse(JSON.stringify(this.actions));
  }

  cancel() {
    this.actions = JSON.parse(JSON.stringify(this.kbs.activeBindings));
    this.changed = false;
  }

  setDefaults() {
    this.actions = JSON.parse(JSON.stringify(DefaultBindings));
    if (!this.kbs.activeBindings) return;
    for (const k in this.actions) {
      if (!this.actions.hasOwnProperty(k)) continue;
      const activeGroup = this.kbs.activeBindings[k as keyof KeyBindings];
      const set = this.actions[k as keyof KeyBindings];
      for (let i = 0; i < set.length; i++) {
        const action = set[i];
        const bound = activeGroup[i];
        action.primaryChanged = bound.primary !== action.primary;
        action.secondaryChanged = bound.secondary !== action.secondary;
      }
    }

    setTimeout(() => this.changed = !!this.changedElements.length);
  }

}
