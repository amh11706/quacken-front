import { Component, OnDestroy, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { WsService } from '../../ws/ws.service';
import { SplitComponent } from './split/split.component';
import { InCmd, OutCmd } from '../../ws/ws-messages';
import { Item, Inventory } from '../profile/types';

@Component({
  selector: 'q-inventory',
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class InventoryComponent implements OnDestroy {
  ws = inject(WsService);
  private dialog = inject(MatDialog);

  private _id?: number;
  @Input() set id(value: number | undefined) {
    if (this._id) this.ngOnDestroy();
    this._id = value;
    this.doSubs();
  }

  get id(): number | undefined {
    return this._id;
  }

  inventory$ = new BehaviorSubject<Item[] | undefined>(undefined);
  inv?: Inventory;
  dragging?: Item;

  private subs = new Subscription();
  private searchDebounce?: number;

  constructor() {
    this.id = this.ws.user?.inventory;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.id) this.ws.send(OutCmd.InventoryCmd, { cmd: 'c', id: this.id });
  }

  private doSubs() {
    if (!this.id) return;
    this.ws.send(OutCmd.InventoryCmd, { cmd: 'o', id: this.id });
    this.subs.add(this.ws.subscribe(InCmd.IntentoryOpen, i => {
      this.inventory$.next(i.items);
      this.inv = i;
      this.inv.filtered = i.items;
      this.sort(i.sort);
    }));
    this.subs.add(this.ws.subscribe(InCmd.InventoryCoin, q => {
      if (this.inv) this.inv.currency = q;
    }));
    this.subs.add(this.ws.connected$.subscribe(v => {
      if (!v || !this.id) return;
      this.ws.send(OutCmd.InventoryCmd, { cmd: 'o', id: this.id });
    }));

    this.subs.add(this.ws.subscribe(InCmd.InventoryUpdate, u => {
      if (!this.inv) return;
      if (u.update) {
        for (const update of u.update) {
          for (const i of this.inv.items) {
            if (i.s === update.id) {
              i.q = update.quantity;
              i.f = true;
              break;
            }
          }
        }
      }
      if (u.new) {
        for (const update of u.new) {
          update.f = true;
          this.inv.filtered?.push(update);
          if (this.inv.filtered !== this.inv.items) this.inv.items.push(update);
          this.sort(this.inv.sort, false);
        }
      }
      if (u.del) {
        this.inv.filtered = this.inv.filtered.filter(i => u.del?.indexOf(i.s) === -1);
        if (this.inv.filtered !== this.inv.items) {
          this.inv.items = this.inv.items.filter(i => u.del?.indexOf(i.s) === -1);
        }
      }
    }));
  }

  clickStack(i: Item): void {
    if (i.q < 2 || !this.id) return;
    const dialog = this.dialog.open(SplitComponent, { data: i });
    dialog.afterClosed().subscribe(value => {
      if (!value || !this.id) return;
      this.ws.send(OutCmd.InventoryCmd, { cmd: 's', id: this.id, data: { id: i.s, quantity: value } });
    });
  }

  drop(e: DragEvent, i: Item): void {
    if (!this.dragging || !this.id) return;
    e.preventDefault();
    if (i.id !== this.dragging.id || i.q >= 250) return;
    this.ws.send(OutCmd.InventoryCmd, { cmd: 'cb', id: this.id, data: { from: this.dragging.s, to: i.s } });
    delete this.dragging;
  }

  sort(by: 's' | 'id' | 't' | 'q' | 'n' | 'f', send = true): void {
    if (!this.id) return;
    if (send) this.ws.send(OutCmd.InventoryCmd, { cmd: 'sort', id: this.id, data: by });
    if (!this.inv) return;
    this.inv.filtered.sort((a, b) => {
      const c = a[by];
      const d = b[by];
      if (typeof c === 'boolean') {
        if (c === d) return 0;
        return c ? -1 : 1;
      }
      if (c > d) return 1;
      else if (c < d) return -1;
      return 0;
    });
  }

  searchBounce(key: string): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = window.setTimeout(() => this.search(key), 500);
  }

  search(key: string): void {
    if (!this.inv) return;
    if (!key) {
      this.inv.filtered = this.inv.items;
      return;
    }

    this.inv.filtered = [];
    const search = key.toLowerCase();
    // eslint-disable-next-line no-labels
    itemLoop:
    for (const i of this.inv.items) {
      const values = Object.values(i);
      for (let value of values) {
        value = value.toString().toLowerCase();
        if (value.indexOf(search) !== -1) {
          this.inv.filtered.push(i);
          // eslint-disable-next-line no-labels
          continue itemLoop;
        }
      }
    }
  }
}
