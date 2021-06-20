import { Component, OnInit, ViewChild } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Internal, OutCmd } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';
import { SettingPartial, SettingsService } from '../settings.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MapFilterComponent } from './map-filter/map-filter.component';
import { Settings } from '../setting/settings';
import { MapOption } from './map-card/map-card.component';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

@Component({
  selector: 'q-map-list',
  templateUrl: './map-list.component.html',
  styleUrls: ['./map-list.component.scss']
})

export class MapListComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport, { static: true }) mapViewport?: CdkVirtualScrollViewport;
  search = '';
  selectedMap: SettingPartial = { value: 0 };
  private servermapList: MapOption[] = [];
  private filteredMapList: MapOption[] = [];
  private mapHeight = 36;
  private mapWidth = 20;
  maplist = new ReplaySubject<MapOption[]>(1);
  selectedFilters: string[] = [];
  sortList = [
    'Ascending Avg. Rating', 'Descending Avg. Rating',
    'Ascending User', 'Descending User',
    'Ascending Map Name', 'Descending Map Name',
  ];
  selectedSortOption = this.sortList[0];
  private tagList: string[] = [];
  private userList: string[] = [];
  private setting = Settings['cadeMap'];

  constructor(private bottomSheet: MatBottomSheet, public ws: WsService, public ss: SettingsService) { }

  async ngOnInit() {
    this.ws.subscribe(Internal.Lobby, async l => {
      if ((await this.ss.get(this.setting.group, this.setting.name)).value > 1 || !l.map || !this.servermapList[0]) return
      const generatedMap = this.servermapList[0];
      generatedMap.data = this.b64ToArray(l.map);
      generatedMap.description = l.seed;
    });
    this.initGenerated();
    this.servermapList.push(...await this.ws.request(OutCmd.CgMapList));
    this.initFilters();
    this.maplist.next(this.servermapList);

    this.selectedMap = await this.ss.get(this.setting.group, this.setting.name);
    setTimeout(() => {
      this.mapViewport?.scrollToIndex(this.servermapList.findIndex(m => m.id === this.selectedMap.value));
    });
  }

  initGenerated() {
    this.servermapList.push({
      id: 0,
      description: '',
      name: 'Generated',
      released: false,
      userId: 0,
      username: '',
      tags: [],
      ratingAverage: 0,
      ratingCount: 0,
      data: this.initMap(),
    });
  }

  initFilters() {
    this.servermapList.forEach((map) => {
      for (let tag of map.tags) {
        if (tag && !this.tagList.includes(tag)) this.tagList.push(tag);
      }
      if (map.username && !this.userList.includes(map.username)) this.userList.push(map.username);
    });
  }

  openFilterWindow() {
    this.bottomSheet.open(MapFilterComponent, {
      data: {
        tagList: this.tagList,
        userList: this.userList,
        toggleTag: this.toggleTag.bind(this),
      },
    });
  }

  initMap() {
    const map = [];
    for (let y = 0; y < this.mapHeight; y++) {
      const row = [];
      for (let x = 0; x < this.mapWidth; x++) {
        row.push(0);
      }
      map.push(row);
    }
    return map;
  }

  b64ToArray(map: string): number[][] {
    const data = this.initMap();
    const bString = atob(map);
    let i = 0;
    for (let y = 0; y < this.mapHeight; y++) {
      for (let x = 0; x < this.mapWidth; x++) {
        data[y][x] = bString.charCodeAt(i);
        i++;
      }
    }
    return data;
  }

  async selectMap(id: number) {
    const maps = this.servermapList;
    const map = id < 0 ? maps[Math.floor(Math.random() * maps.length)] : maps.find(m => m.id === id);
    this.ss.save({
      id: this.setting.id,
      name: this.setting.name,
      value: map?.id || 0,
      group: this.setting.group,
      data: map?.name || 'Generated',
    });
  }

  filter() {
    if (!this.search) this.maplist.next(this.servermapList);
    const search = new RegExp(this.search, 'i');
    this.filteredMapList = this.servermapList.filter(map => {
      const textMatched = search.test(map.name) || search.test(map.username) || map.tags.some(search.test);
      if (!textMatched || this.selectedFilters.length === 0) return textMatched;

      const tagMatched = this.selectedFilters.some(filter => {
        return filter === map.username || +filter <= map.ratingAverage || map.tags.includes(filter);
      });
      return tagMatched;
    });
    this.maplist.next(this.filteredMapList);
  }

  toggleTag(tag: string): void {
    if (this.selectedFilters.indexOf(tag) !== -1) {
      this.selectedFilters = this.selectedFilters.filter(el => el !== tag);
    } else {
      this.selectedFilters.push(tag);
    }

    this.filter();
  }

  sort(value: string) {
    switch (value) {
      case this.sortList[0]: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 : (n1.ratingAverage || Number.MIN_VALUE) - (n2.ratingAverage || Number.MIN_VALUE)))); break;
      case this.sortList[1]: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 : (n2.ratingAverage || Number.MIN_VALUE) - (n1.ratingAverage || Number.MIN_VALUE)))); break;
      case this.sortList[2]: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 : n1.username.toLowerCase().localeCompare(n2.username.toLowerCase())))); break;
      case this.sortList[3]: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 : n2.username.toLowerCase().localeCompare(n1.username.toLowerCase())))); break;
      case this.sortList[4]: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 : n1.name.toLowerCase().localeCompare(n2.name.toLowerCase())))); break;
      case this.sortList[5]: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 : n2.name.toLowerCase().localeCompare(n1.name.toLowerCase())))); break;
      default: this.maplist.next(this.servermapList);
    }
  }

}
