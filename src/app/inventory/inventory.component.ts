import { Component, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { WsService } from '../ws.service';
import { InventoryService } from './inventory.service';
import { SplitComponent } from './split/split.component';
import { InCmd, OutCmd } from '../ws-messages';

export interface Item {
  s: number;
  id: number;
  t: number;
  q: number;
  n: string;
  f: boolean;
}

interface Inventory {
  id: number;
  userId: number;
  items: Item[];
  filtered: Item[];
  sort: keyof Item;
  currency: number;
}

interface InvUpdate {
  del?: number[];
  new?: Item[];
  update?: { id: number, quantity: number }[];
}

@Component({
  selector: 'q-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnDestroy {
  private _id?: number;
  @Input() set id(value: number | undefined) {
    if (this._id) this.ngOnDestroy();
    this._id = value;
    this.doSubs();
  }
  get id(): number | undefined {
    return this._id;
  }

  inv?: Inventory;
  dragging?: Item;

  private subs = new Subscription();
  private searchDebounce?: number;

  constructor(
    public ws: WsService,
    public is: InventoryService,
    private dialog: MatDialog,
  ) { }

  ngOnDestroy() {
    if (this.subs) this.subs.unsubscribe();
    this.ws.send(OutCmd.InventoryCmd, { cmd: 'c', id: this.id });
  }

  private doSubs() {
    if (!this.id) return;
    this.ws.send(OutCmd.InventoryCmd, { cmd: 'o', id: this.id });
    this.subs = this.ws.subscribe(InCmd.IntentoryOpen, (i: Inventory) => {
      this.inv = i;
      this.inv.filtered = i.items;
      this.sort(i.sort);
    });
    this.subs.add(this.ws.subscribe(InCmd.InventoryCoin, (q: number) => {
      if (this.inv) this.inv.currency = q;
    }));
    this.subs.add(this.ws.connected$.subscribe(value => {
      this.ws.send(OutCmd.InventoryCmd, { cmd: 'o', id: this.id });
    }));

    this.subs.add(this.ws.subscribe(InCmd.InventoryUpdate, (u: InvUpdate) => {
      if (!this.inv) return;
      if (u.update) for (const update of u.update) {
        for (const i of this.inv.items) if (i.s === update.id) {
          i.q = update.quantity;
          i.f = true;
          break;
        }
      }
      if (u.new) for (const update of u.new) {
        update.f = true;
        this.inv.filtered?.push(update);
        if (this.inv.filtered !== this.inv.items) this.inv.items.push(update);
        this.sort(this.inv.sort, false);
      }
      if (u.del) {
        this.inv.filtered = this.inv.filtered.filter(i => u.del?.indexOf(i.s) === -1);
        if (this.inv.filtered !== this.inv.items) {
          this.inv.items = this.inv.items.filter(i => u.del?.indexOf(i.s) === -1);
        }
      }
    }));
  }

  clickStack(i: Item) {
    if (i.q < 2) return;
    const dialog = this.dialog.open(SplitComponent, { data: i });
    dialog.afterClosed().subscribe(value => {
      if (!value) return;
      this.ws.send(OutCmd.InventoryCmd, { cmd: 's', id: this.id, data: { id: i.s, quantity: value } });
    });
  }

  drop(e: DragEvent, i: Item) {
    if (!this.dragging) return;
    e.preventDefault();
    if (i.id !== this.dragging.id || i.q >= 250) return;
    this.ws.send(OutCmd.InventoryCmd, { cmd: 'cb', id: this.id, data: { from: this.dragging.s, to: i.s } });
    delete this.dragging;
  }

  sort(by: 's' | 'id' | 't' | 'q' | 'n' | 'f', send = true) {
    if (send) this.ws.send(OutCmd.InventoryCmd, { cmd: 'sort', id: this.id, data: by });
    if (!this.inv) return;
    this.inv.filtered.sort((a, b) => {
      const c: any = a[by];
      const d: any = b[by];
      if (typeof c === 'boolean') {
        if (c === d) return 0;
        return c ? -1 : 1;
      }
      if (c > d) return 1;
      else if (c < d) return -1;
      return 0;
    });
  }

  searchBounce(key: string) {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = window.setTimeout(() => this.search(key), 500);
  }

  search(key: string) {
    if (!this.inv) return;
    if (!key) {
      this.inv.filtered = this.inv.items;
      return;
    }

    this.inv.filtered = [];
    const search = key.toLowerCase();
    itemLoop:
    for (const i of this.inv.items) {
      const values = Object.values(i);
      for (let value of values) {
        value = value.toString().toLowerCase();
        if (value.indexOf(search) !== -1) {
          this.inv.filtered.push(i);
          continue itemLoop;
        }
      }
    }
  }

}
