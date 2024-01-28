import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { debounceTime, mergeMap } from 'rxjs/operators';
import { OutCmd } from '../../ws/ws-messages';
import { WsService } from '../../ws/ws.service';
import { FriendsService } from '../friends/friends.service';

@Component({
  selector: 'q-name-search',
  templateUrl: './name-search.component.html',
  styleUrls: ['./name-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NameSearchComponent implements OnInit {
  @Input() set value(v: string) {
    this.myControl.setValue(v);
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
        debounceTime(300),
        mergeMap(value => this.searchName(value)),
      );
  }

  private async searchName(search: string): Promise<string[]> {
    if (search.length < 2) {
      const nameTemp = [...this.fs.lobby$.getValue().map(m => m.from), ...this.fs.friends];
      if (!this.onlineOnly) nameTemp.push(...this.fs.offline);
      const names = new Map(nameTemp.map(n => [n, undefined]));

      return Promise.resolve(Array.from(names.keys()));
    }
    const names = await this.ws.request(this.onlineOnly ? OutCmd.SearchNamesOnline : OutCmd.SearchNames, search);
    return names || [];
  }
}
