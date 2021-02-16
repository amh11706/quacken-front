import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { SettingsService } from '../settings.service';
import { KeyActions } from './key-actions';

const IgnoreKeys = ['Control', 'Shift', 'Alt'];

export interface KeyBinding {
  action: KeyActions;
  primary: string;
  secondary: string;
  primaryChanged?: boolean;
  secondaryChanged?: boolean;
}

export interface KeyBindings {
  general: KeyBinding[];
  moves: KeyBinding[];
  editor: KeyBinding[];
}

type DeepReadonly<T> = { readonly [K in keyof T]: DeepReadonly<T[K]> };
type StaticKeyBindings = DeepReadonly<KeyBindings>;

export const DefaultBindings: StaticKeyBindings = {
  general: [
    { action: KeyActions.ToggleEscMenu, primary: 'Escape', secondary: 'n/a' },
    { action: KeyActions.FocusChat, primary: 't', secondary: 'Enter' },
    { action: KeyActions.ShowStats, primary: 'Tab', secondary: 'n/a' },
  ],
  moves: [
    { action: KeyActions.Left, primary: 'a', secondary: 'ArrowLeft' },
    { action: KeyActions.Forward, primary: 'w', secondary: 'ArrowUp' },
    { action: KeyActions.Right, primary: 'd', secondary: 'ArrowRight' },
    { action: KeyActions.Blank, primary: 's', secondary: 'ArrowDown' },
    { action: KeyActions.NextSlot, primary: 'Shift + s', secondary: 'Shift + ArrowDown' },
    { action: KeyActions.PrevSlot, primary: 'shift + w', secondary: 'shift + ArrowUp' },
    { action: KeyActions.Back, primary: 'Backspace', secondary: 'Ctrl + z' },
    { action: KeyActions.BombLeft, primary: 'q', secondary: 'Shift + ArrowLeft' },
    { action: KeyActions.BombRight, primary: 'e', secondary: 'Shift + ArrowRight' },
  ],
  editor: [
    { action: KeyActions.Save, primary: 'Ctrl + s', secondary: 'n/a' },
    { action: KeyActions.Undo, primary: 'Ctrl + z', secondary: 'n/a' },
    { action: KeyActions.Redo, primary: 'Ctrl + y', secondary: 'n/a' },
  ],
};

@Injectable({
  providedIn: 'root'
})
export class KeyBindingService {
  private bindSub?: Subject<string>;
  private subMap = new Map<KeyActions, Subject<boolean>>();
  private bindings = new Map<string, KeyActions[]>();
  private _activeBindings?: StaticKeyBindings;
  get activeBindings() { return this._activeBindings; }

  constructor(ss: SettingsService) {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    ss.get('controls', 'bindings').then(setting => {
      this.setBindings(setting?.data ? setting.data : DefaultBindings);
    });
  }

  private getKey(e: KeyboardEvent): string {
    let modifiers = '';
    if (e.ctrlKey) modifiers += 'Ctrl + ';
    if (e.shiftKey) modifiers += 'Shift + ';
    if (e.altKey) modifiers += 'Alt + ';
    return modifiers + e.key;
  }

  private emitAction(e: KeyboardEvent, key: string, value = true) {
    const actions = this.bindings.get(key);
    if (!actions) return;

    for (const action of actions) {
      const sub = this.subMap.get(action);
      if (!sub || sub.observers.length === 0) return;
      e.preventDefault();
      sub.next(value);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (e.repeat || document.activeElement?.tagName === 'INPUT' || IgnoreKeys.includes(e.key)) return;
    const key = this.getKey(e);

    if (this.bindSub) {
      e.preventDefault();
      this.bindSub.next(key);
      return;
    }

    this.emitAction(e, key);
  }

  private handleKeyUp = (e: KeyboardEvent) => {
    if (this.bindSub || document.activeElement?.tagName === 'INPUT' || IgnoreKeys.includes(e.key)) return;
    const key = this.getKey(e);

    this.emitAction(e, key, false);
  }

  private addAction(key: string, action: KeyActions) {
    if (key === 'n/a') return;
    const list = this.bindings.get(key) || [];
    this.bindings.set(key, list);
    list.push(action);
  }

  setBindings(bindings: StaticKeyBindings) {
    this.bindings.clear();
    for (const k in bindings) {
      if (!bindings.hasOwnProperty(k)) continue;
      for (const binding of bindings[k as keyof KeyBindings]) {
        this.addAction(binding.primary, binding.action);
        if (binding.primary !== binding.secondary) this.addAction(binding.secondary, binding.action);
      }
    }
    this._activeBindings = bindings;
  }

  subscribe(action: KeyActions, cb: (value: boolean) => void) {
    const sub = this.subMap.get(action) || new Subject();
    this.subMap.set(action, sub);
    return sub.subscribe(cb);
  }

  bindSubscribe(cb: (e: string) => void) {
    if (this.bindSub) throw new Error('Already subbed');

    this.bindSub = new Subject();
    const sub = this.bindSub.subscribe(cb);
    sub.add(() => {
      delete this.bindSub;
    });
    return sub;
  }
}
