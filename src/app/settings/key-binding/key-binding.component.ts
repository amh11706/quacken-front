import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SettingsService } from '../settings.service';
import { KeyBindingService } from './key-binding.service';
import { ExitPromptComponent } from './exit-prompt/exit-prompt.component';
import { KeyBindings, KeyBinding, DefaultBindings, KeyActions, LinkGroups, NotActive } from './key-actions';
import { Subject } from 'rxjs';

export interface KeyBindingEditMode extends KeyBinding {
  activeBindings: Readonly<[string, string]>;
  defaultBindings: Readonly<[string, string]>;
  links?: KeyBinding[];
  update: Subject<void>;
  group: keyof KeyBindings;
}

type KeyBindingsEditMode = Record<keyof KeyBindings, KeyBindingEditMode[]>;

@Component({
  selector: 'q-key-binding',
  templateUrl: './key-binding.component.html',
  styleUrls: ['./key-binding.component.scss']
})
export class KeyBindingComponent implements OnInit, OnDestroy {
  actions = new KeyBindings() as KeyBindingsEditMode;
  private changedElements: HTMLCollectionOf<Element>;
  private notDefaultElements: HTMLCollectionOf<Element>;
  group: keyof KeyBindings = 'Global';
  changed = false;
  notDefault = false;
  takenKeys = new Map<string, KeyBindingEditMode>();

  constructor(
    private kbs: KeyBindingService,
    private ss: SettingsService,
    private dialog: MatDialog,
    el: ElementRef<HTMLElement>,
  ) {
    this.changedElements = el.nativeElement.getElementsByClassName('changed');
    this.notDefaultElements = el.nativeElement.getElementsByClassName('notdefault');
  }

  async ngOnInit() {
    if (!this.kbs.activeBindings) return;
    const groupMap = new Map<LinkGroups, KeyBinding[]>();
    for (const key in this.actions) {
      if (!this.actions.hasOwnProperty(key)) continue;
      const k = key as keyof KeyBindings;
      const activeGroup = this.kbs.activeBindings[k];
      const defaultGroup = DefaultBindings[k];
      const editGroup = this.actions[k];
      for (let i = 0; i < defaultGroup.length; i++) {
        const b: KeyBindingEditMode = {
          ...defaultGroup[i],
          bindings: [...activeGroup[i].bindings],
          activeBindings: activeGroup[i].bindings,
          defaultBindings: defaultGroup[i].bindings,
          update: new Subject(),
          group: k,
        };
        editGroup.push(b);

        if (b.linkGroup === undefined) continue;
        const group = groupMap.get(b.linkGroup) || [];
        groupMap.set(b.linkGroup, group);
        group.push(b);
        b.links = group;
      }
    }

    this.updateChanged();
    this.setTakenKeys();
  }

  ngOnDestroy() {
    this.exitPrompt();
  }

  private setTakenKeys() {
    this.takenKeys.clear();
    const groups: (keyof KeyBindings)[] = this.group === 'Global' ?
      Object.keys(this.actions) as (keyof KeyBindings)[] :
      ['Global', this.group];

    for (const group of groups) {
      for (const binding of this.actions[group]) {
        for (const key of binding.bindings) if (key !== NotActive) this.takenKeys.set(key, binding);
      }
    }
  }

  changeGroup() {
    this.setTakenKeys();
    this.exitPrompt();
    this.updateChanged();
  }

  private exitPrompt() {
    if (!this.changedElements.length) return;
    this.dialog.open(ExitPromptComponent).afterClosed().subscribe((v: boolean) => {
      if (v) this.save();
      else this.cancel();
    });
  }

  updateChanged() {
    setTimeout(() => {
      this.changed = !!this.changedElements.length;
      this.notDefault = !!this.notDefaultElements.length;
    });
  }

  async save() {
    const toActivate = new KeyBindings();
    const toSave: Record<KeyActions, [string, string]> = {} as any;

    const updateLinked = await this.ss.get('controls', 'updateLinked');
    if (updateLinked.value) {
      for (const binding of this.actions[this.group]) {
        if (!binding.links) continue;
        for (const link of binding.links) link.bindings = [...binding.bindings];
      }
    }

    for (const key in this.actions) {
      if (!this.actions.hasOwnProperty(key)) continue;
      const k = key as keyof KeyBindings;
      const set = this.actions[k];
      for (let i = 0; i < set.length; i++) {
        const binding = set[i];
        binding.activeBindings = [...binding.bindings];
        toActivate[k].push({ action: binding.action, bindings: [...binding.bindings], title: binding.title, linkGroup: binding.linkGroup });
        toSave[binding.action] = binding.bindings;
      }
    }
    this.ss.save({
      id: 32, name: 'bindings', group: 'controls', value: 0,
      data: toSave,
    });

    for (const binding of this.actions[this.group]) {
      binding.update.next();
    }

    this.kbs.setBindings(toActivate);
    this.updateChanged();
  }

  cancel() {
    for (const k in this.actions) {
      if (!this.actions.hasOwnProperty(k)) continue;
      for (const binding of this.actions[k as keyof KeyBindings]) {
        binding.bindings = [...binding.activeBindings];
        binding.update.next();
      }
    }

    this.setTakenKeys();
    this.updateChanged();
  }

  setDefaults() {
    let anyChanged = false;
    do {
      anyChanged = false;
      for (const k in this.actions) {
        if (!this.actions.hasOwnProperty(k)) continue;
        for (const binding of this.actions[k as keyof KeyBindings]) {
          let changed = false;
          const toSet = k === this.group ? binding.defaultBindings : binding.activeBindings;
          for (let i = 0; i < binding.bindings.length; i++) {
            if (toSet[i] === binding.bindings[i]) continue;
            const conflict = this.takenKeys.get(toSet[i]);
            if (!conflict || conflict === binding) {
              this.takenKeys.delete(binding.bindings[i]);
              binding.bindings[i] = toSet[i];
              this.takenKeys.set(binding.bindings[i], binding);
              changed = true;
            }
          }
          if (changed) {
            binding.update.next();
            anyChanged = true;
          }
        }
      }
    } while (anyChanged);

    this.updateChanged();
  }

}
