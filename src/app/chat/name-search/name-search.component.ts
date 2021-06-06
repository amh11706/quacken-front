import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { startWith, debounceTime, mergeMap } from 'rxjs/operators';
import { OutCmd } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';
import { FriendsService } from '../friends/friends.service';

@Component({
  selector: 'q-name-search',
  templateUrl: './name-search.component.html',
  styleUrls: ['./name-search.component.scss']
})
export class NameSearchComponent implements OnInit {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
  searchedNames?: Observable<string[]>;
  myControl = new FormControl();

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

  private searchName(search: string): Promise<string[]> {
    if (search.length < 2) {
      const names = new Map([
        ...this.fs.lobby.map(m => m.from),
        ...this.fs.friends,
        ...this.fs.offline,
      ].map(n => [n, undefined]));

      return Promise.resolve(Array.from(names.keys()));
    }
    return this.ws.request(OutCmd.SearchNames, search);
  }

}
