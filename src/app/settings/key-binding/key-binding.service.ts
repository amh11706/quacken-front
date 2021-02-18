import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { WsService } from 'src/app/ws.service';
import { SettingsService } from '../settings.service';
import { DefaultBindings, KeyActions, KeyBindings, NotActive, StaticKeyBindings } from './key-actions';

const IgnoreKeys = ['Control', 'Shift', 'Alt'];

function mergeBindings(input: Record<KeyActions, [string, string]>): StaticKeyBindings {
  const merged = new KeyBindings();
  for (const k in DefaultBindings) {
    if (!DefaultBindings.hasOwnProperty(k)) continue;
    for (const binding of DefaultBindings[k as keyof KeyBindings]) {
      merged[k as keyof KeyBindings].push({ ...binding, bindings: input[binding.action] || binding.bindings });
    }
  }
  return merged;
}

@Injectable({
  providedIn: 'root'
})
export class KeyBindingService {
  private bindSub?: Subject<string>;
  private subMap = new Map<KeyActions, Subject<boolean>>();
  private bindings = new Map<string, KeyActions[]>();
  private _activeBindings?: StaticKeyBindings;
  get activeBindings() { return this._activeBindings; }

  constructor(ss: SettingsService, private ws: WsService) {
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    ws.connected$.subscribe(v => {
      if (!v) return;
      ss.get('controls', 'bindings').then(setting => {
        this.setBindings(mergeBindings(setting?.data || {}));
      });
    });
  }

  private getKey(e: KeyboardEvent): string {
    const key = e.key === ' ' ? 'Space' : e.key;
    let modifiers = '';
    if (e.ctrlKey) modifiers += 'Ctrl + ';
    if (e.shiftKey) modifiers += 'Shift + ';
    if (e.altKey) modifiers += 'Alt + ';
    return modifiers + key;
  }

  private emitAction(e: KeyboardEvent, key: string, value = true) {
    const actions = this.bindings.get(key);
    if (!actions) return;

    for (const action of actions) {
      const sub = this.subMap.get(action);
      if (!sub || sub.observers.length === 0) continue;
      e.preventDefault();
      if (!e.repeat) sub.next(value);
    }
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.ws.connected) return;
    if (document.activeElement?.tagName === 'INPUT' || IgnoreKeys.includes(e.key)) return;
    const key = this.getKey(e);

    if (this.bindSub) {
      e.preventDefault();
      this.bindSub.next(key);
      return;
    }

    this.emitAction(e, key);
  }

  private handleKeyUp = (e: KeyboardEvent) => {
    if (!this.ws.connected) return;
    if (this.bindSub || document.activeElement?.tagName === 'INPUT' || IgnoreKeys.includes(e.key)) return;
    const key = this.getKey(e);

    this.emitAction(e, key, false);
  }

  private addAction(key: string, action: KeyActions) {
    if (key === NotActive) return;
    const list = this.bindings.get(key) || [];
    this.bindings.set(key, list);
    list.push(action);
  }

  setBindings(bindings: StaticKeyBindings) {
    this.bindings.clear();
    for (const k in bindings) {
      if (!bindings.hasOwnProperty(k)) continue;
      for (const binding of bindings[k as keyof KeyBindings]) {
        const bs = binding.bindings;
        if (bs[0] !== NotActive) this.addAction(bs[0], binding.action);
        if (bs[1] !== NotActive && bs[0] !== bs[1]) this.addAction(bs[1], binding.action);
      }
    }
    this._activeBindings = bindings;
  }

  subscribe(action: KeyActions, cb: (value: boolean) => void) {
    if (action === KeyActions.Noop) return;
    const subject = this.subMap.get(action) || new Subject();
    this.subMap.set(action, subject);
    return subject.subscribe(cb);
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
