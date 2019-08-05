import { Component, OnDestroy, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatDialog } from '@angular/material';

import { WsService } from '../ws.service';
import { InventoryService } from './inventory.service';
import { SplitComponent } from './split/split.component';

export interface Item {
  s?: number,
  id?: number,
  t?: number,
  q?: number,
  n?: string,
  f?: boolean,
}

interface Inventory {
  id?: number,
  userId?: number,
  items?: Item[],
  filtered?: Item[];
  sort?: string,
  currency?: number,
}

interface InvUpdate {
  del?: number[],
  new?: Item[],
  update?: { id: number, quantity: number }[],
}

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.css']
})
export class InventoryComponent implements OnDestroy {
  private _id;
  @Input() set id(value: number) {
    if (this._id) this.ws.send('i/' + this._id + '/c');
    this._id = value;
    this.doSubs();
  }
  get id(): number {
    return this._id;
  }

  inv: Inventory = {};
  dragging: Item = {};

  private subs: Subscription;
  private searchDebounce: number;

  constructor(
    public ws: WsService,
    public is: InventoryService,
    private dialog: MatDialog,
  ) { }

  ngOnDestroy() {
    if (this.subs) this.subs.unsubscribe();
    this.ws.send('i/' + this.id + '/c');
  }

  private doSubs() {
    if (this.subs) this.subs.unsubscribe();
    if (!this.id) return;
    this.ws.send('i/open', this.id);
    this.subs = this.ws.subscribe('i/' + this.id + '/l', i => {
      this.inv = i;
      this.inv.filtered = i.items;
      this.sort(i.sort);
    });
    this.subs = this.ws.subscribe('i/' + this.id + '/coin', q => {
      this.inv.currency = q;
    });
    this.subs.add(this.ws.connected$.subscribe(value => {
      if (value) this.ws.send('i/open', this.id);
    }));

    this.subs.add(this.ws.subscribe('i/' + this.id + '/u', (u: InvUpdate) => {
      if (u.update) for (const update of u.update) {
        for (const i of this.inv.items) if (i.s === update.id) {
          i.q = update.quantity;
          i.f = true;
          break;
        }
      }
      if (u.new) for (const update of u.new) {
        update.f = true;
        this.inv.filtered.push(update);
        if (this.inv.filtered !== this.inv.items) this.inv.items.push(update);
        this.sort(this.inv.sort, false);
      }
      if (u.del) {
        this.inv.filtered = this.inv.filtered.filter(i => u.del.indexOf(i.s) === -1);
        if (this.inv.filtered !== this.inv.items) {
          this.inv.items = this.inv.items.filter(i => u.del.indexOf(i.s) === -1);
        }
      }
    }));
  }

  clickStack(i: Item) {
    if (i.q < 2) return;
    const dialog = this.dialog.open(SplitComponent, { data: i });
    dialog.afterClosed().subscribe(value => {
      if (!value) return;
      this.ws.send('i/' + this.id + '/s', { id: i.s, quantity: value });
    });
  }

  drop(e: DragEvent, i: Item) {
    e.preventDefault();
    if (i.id !== this.dragging.id || i.q >= 250) return;
    this.ws.send('i/' + this.id + '/cb', { from: this.dragging.s, to: i.s });
    this.dragging = {};
  }

  sort(by: string, send = true) {
    if (send) this.ws.send('i/' + this.id + '/sort', by);
    this.inv.filtered.sort((a, b) => {
      const c = a[by];
      const d = b[by];
      if (typeof c === 'boolean') {
        if (c === d) return 0
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
    if (!key) return this.inv.filtered = this.inv.items;
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
