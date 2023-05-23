import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ReplaySubject, Subscription } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';

import { Internal, OutCmd } from '../../ws-messages';
import { WsService } from '../../ws.service';
import { SettingPartial, SettingsService } from '../settings.service';
import { MapFilterComponent } from './map-filter/map-filter.component';
import { Settings } from '../setting/settings';
import { MapOption } from './map-card/map-card.component';

const enum SortOptions {
  AscendingAvgRating = 'Ascending Avg. Rating',
  DescendingAvgRating = 'Descending Avg. Rating',
  Newest = 'Newest',
  Oldest = 'Oldest',
  AscendingUser = 'Ascending User',
  DescendingUser = 'Descending User',
  AscendingMapName = 'Ascending Map Name',
  DescendingMapName = 'Descending Map Name',
  MapsYouRated = 'Maps You Rated',
}

@Component({
  selector: 'q-map-list',
  templateUrl: './map-list.component.html',
  styleUrls: ['./map-list.component.scss'],
})

export class MapListComponent implements OnInit, OnDestroy {
  @ViewChild(CdkVirtualScrollViewport, { static: true }) mapViewport?: CdkVirtualScrollViewport;
  @Input() set visible(v: boolean) {
    if (!v) return;
    const i = this.filteredMapList.findIndex(m => m.id === this.selectedMap.value);
    if (i !== -1) {
      setTimeout(() => {
        this.mapViewport?.scrollToIndex(i);
      });
    }
  }

  @Input() rankArea = 2;

  search = '';
  selectedMap: SettingPartial = { value: 0 };
  private servermapList: MapOption[] = [];
  private filteredMapList: MapOption[] = [];
  private mapHeight = 36;
  private mapWidth = 20;
  maplist = new ReplaySubject<MapOption[]>(1);
  selectedFilters: string[] = [];
  sortList = [
    SortOptions.AscendingAvgRating, SortOptions.DescendingAvgRating,
    SortOptions.Newest, SortOptions.Oldest,
    SortOptions.AscendingUser, SortOptions.DescendingUser,
    SortOptions.AscendingMapName, SortOptions.DescendingMapName,
    SortOptions.MapsYouRated,
  ];

  selectedSortOption = this.sortList[1] || '';
  private tagList: string[] = [];
  private userList: string[] = [];
  private setting = Settings.cadeMap;
  private subs = new Subscription();

  constructor(private bottomSheet: MatBottomSheet, public ws: WsService, public ss: SettingsService) { }

  async ngOnInit(): Promise<void> {
    if (this.rankArea === 4) this.setting = Settings.flagMap;
    this.subs.add(this.ws.subscribe(Internal.Lobby, async l => {
      const settingValue = (await this.ss.get(this.setting.group, this.setting.name))?.value || 0;
      if (settingValue > 1 || !l.map || !this.servermapList[0]) return;
      const generatedMap = this.servermapList[0];
      generatedMap.data = this.b64ToArray(l.map);
      generatedMap.description = l.seed;
    }));
    this.initGenerated();
    this.servermapList.push(...await this.ws.request(OutCmd.CgMapList, this.rankArea));
    this.filteredMapList = this.servermapList;
    this.sort(this.selectedSortOption);
    this.initFilters();
    this.maplist.next(this.filteredMapList);
    this.selectedMap = await this.ss.get(this.setting.group, this.setting.name) ?? this.selectedMap;
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  initGenerated(): void {
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
      createdAt: new Date().toISOString(),
    });
  }

  initFilters(): void {
    this.servermapList.forEach((map) => {
      if (map.username && !this.userList.includes(map.username)) this.userList.push(map.username);
      if (!map.tags) return;
      for (const tag of map.tags) {
        if (tag && !this.tagList.includes(tag)) this.tagList.push(tag);
      }
    });
  }

  openFilterWindow(): void {
    this.bottomSheet.open(MapFilterComponent, {
      data: {
        tagList: this.tagList,
        userList: this.userList,
        toggleTag: this.toggleTag.bind(this),
      },
    });
  }

  initMap(): number[][] {
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
    const bString = window.atob(map);
    let i = 0;
    for (let y = 0; y < this.mapHeight; y++) {
      const row = data[y];
      if (!row) break;
      for (let x = 0; x < this.mapWidth; x++) {
        row[x] = bString.charCodeAt(i);
        i++;
      }
    }
    return data;
  }

  selectMap(id: number): void {
    const maps = this.filteredMapList.length < 1 ? this.servermapList : this.filteredMapList;
    const map = id < 0 ? maps[Math.floor(Math.random() * maps.length)] : maps.find(m => m.id === id);
    if (!map) return;
    void this.ss.save({
      id: this.setting.id,
      name: this.setting.name,
      title: this.setting.label || this.setting.name,
      value: map.id || 0,
      group: this.setting.group,
      data: map.username ? `${map.name} (${map.username})` : 'Generated',
    });
    this.selectedMap.value = map.id;
    if (id < 0) this.visible = true;
  }

  filter(): void {
    if (!this.search) this.maplist.next(this.servermapList);
    const search = new RegExp(this.search, 'i');
    this.filteredMapList = this.servermapList.filter(map => {
      const textMatched = search.test(map.name) || search.test(map.username) || map.tags?.some(tag => search.test(tag));
      if (!textMatched || this.selectedFilters.length === 0) return textMatched;

      const tagMatched = this.selectedFilters.some(filter => {
        return filter === map.username || +filter <= map.ratingAverage || map.tags?.includes(filter);
      });
      return tagMatched;
    });
    this.maplist.next(this.filteredMapList);
  }

  toggleTag(tag: string): void {
    if (this.selectedFilters.indexOf(tag) !== -1) {
      this.selectedFilters = this.selectedFilters.filter(el => el !== tag);
    } else {
      if (this.selectedFilters.some(r => [1, 2, 3, 4].includes(+r))) return;
      this.selectedFilters.push(tag);
    }

    this.filter();
  }

  sort(value: string): void {
    switch (value) {
      case SortOptions.AscendingAvgRating: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1
          ? -1
          : (n2.id <= 1 ? 1 : (n1.ratingAverage || Number.MIN_VALUE) - (n2.ratingAverage || Number.MIN_VALUE))));
        break;
      case SortOptions.DescendingAvgRating: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1
          ? -1
          : (n2.id <= 1 ? 1 : (n2.ratingAverage || Number.MIN_VALUE) - (n1.ratingAverage || Number.MIN_VALUE))));
        break;
      case SortOptions.AscendingUser: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 : n1.username.toLowerCase().localeCompare(n2.username.toLowerCase()))));
        break;
      case SortOptions.DescendingUser: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 : n2.username.toLowerCase().localeCompare(n1.username.toLowerCase()))));
        break;
      case SortOptions.Oldest: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 : n1.createdAt.localeCompare(n2.createdAt))));
        break;
      case SortOptions.Newest: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 : n2.createdAt.localeCompare(n1.createdAt))));
        break;
      case SortOptions.AscendingMapName: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 : n1.name.toLowerCase().localeCompare(n2.name.toLowerCase()))));
        break;
      case SortOptions.DescendingMapName: this.maplist.next(this.servermapList.sort((n1, n2) =>
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 : n2.name.toLowerCase().localeCompare(n1.name.toLowerCase()))));
        break;
      case SortOptions.MapsYouRated: this.maplist.next(this.servermapList.sort((n1, n2) => {
        if (n1.id <= 1 || n1.ratingMine === 0) return -1;
        if (n2.id <= 1 || n2.ratingMine === 0) return 1;
        return (n2.ratingMine || Number.MIN_VALUE) - (n1.ratingMine || Number.MIN_VALUE);
      }));
        break;
      default:
        this.maplist.next(this.servermapList);
    }
  }
}
