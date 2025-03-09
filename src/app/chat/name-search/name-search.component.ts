import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Observable, debounceTime, mergeMap, startWith } from 'rxjs';

import { OutCmd } from '../../ws/ws-messages';
import { WsService } from '../../ws/ws.service';
import { FriendsService } from '../friends/friends.service';

@Component({
  selector: 'q-name-search',
  templateUrl: './name-search.component.html',
  styleUrl: './name-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class NameSearchComponent implements OnInit {
  private _value = '';
  @Input() set value(v: string) {
    this.myControl.setValue(v);
    if (this.value && v !== this._value) this.valueChange.emit(v);
    this._value = v;
  }

  get value(): string {
    return this._value;
  }

  @Output() valueChange = new EventEmitter<string>();
  @Input() onlineOnly = false;
  @Input() matInput = true;
  @Input() clearOnFocus = true;
  searchedNames?: Observable<string[]>;
  myControl = new UntypedFormControl();

  constructor(
    private ws: WsService,
    private fs: FriendsService,
  ) { }

  ngOnInit(): void {
    this.searchedNames = this.myControl.valueChanges
      .pipe(
        startWith(''),
        debounceTime(300),
        mergeMap(value => this.searchName(value)),
      );
  }

  blur(): void {
    if (this.clearOnFocus) this.myControl.setValue(this.value);
    else this.value = this.myControl.value;
  }

  private async searchName(search: string): Promise<string[]> {
    let names: string[] | undefined = [];
    if (search.length >= 2) {
      names = await this.ws.request(this.onlineOnly ? OutCmd.SearchNamesOnline : OutCmd.SearchNames, search);
    }
    if (!names?.length) {
      const nameTemp = [...this.fs.lobby$.getValue().map(m => m.from), ...this.fs.friends];
      if (!this.onlineOnly) nameTemp.push(...this.fs.offline);
      const names = new Map(nameTemp.map(n => [n, undefined]));

      return Promise.resolve(Array.from(names.keys()));
    }
    return names;
  }
}
