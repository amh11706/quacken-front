import { Component, HostListener, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Internal, OutCmd } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';
import { SettingPartial, SettingsService } from '../settings.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MapFilterComponent } from './map-filter/map-filter.component';
import { Settings } from '../setting/settings';
import { MapOption } from './map-card/map-card.component';

@Component({
  selector: 'q-map-list',
  templateUrl: './map-list.component.html',
  styleUrls: ['./map-list.component.scss']
})

export class MapListComponent implements OnInit {
  data: string = '';
  generatedSeed: string = '';
  selectedMap: SettingPartial = { value: 0 };
  servermapList: MapOption[] = [];
  mapHeight: number = 36;
  mapWidth: number = 20;
  maplist = new ReplaySubject<MapOption[]>(1);
  selectedFilters: string[] = [];
  visible: boolean = true;
  selectable: boolean = true;
  removable: boolean = true;
  sortList: string[] = [
    "Ascending Avg. Rating", "Descending Avg. Rating",
    "Ascending User", "Descending User",
    "Ascending Map Name", "Descending Map Name",
  ];
  selectedSortOption: string = this.sortList[0];
  tagList: string[] = [];
  userList: string[] = [];
  setting = Settings['cadeMap'];
 
  constructor(private bottomSheet: MatBottomSheet, public ws: WsService, public ss: SettingsService) { }

  async ngOnInit() {
    this.ws.subscribe(Internal.Lobby, l => {
      if (this.selectedMap.value > 1 || !l.map || !this.servermapList[0]) return
      const generatedMap = this.servermapList[0];
      generatedMap.data = this.b64ToArray(l.map);
      generatedMap.description = l.seed;
    });
    this.servermapList = await this.ws.request(OutCmd.CgMapList);
    this.initGenerated();
    this.initFilters();
    this.maplist.next(this.servermapList);
  }

  initGenerated() {
    this.servermapList.unshift({
      id: 0,
      description: "",
      name: "Generated",
      released: false,
      userId: 0,
      username: "",
      tags: [""],
      ratingAverage: 0,
      ratingCount: 0,
      data: this.initMap(),
    });
  }

  initFilters() {
    this.servermapList.forEach((map) => {
      for (let tag of map.tags) {
        const search = new RegExp(tag, 'i')
        if ((!this.tagList.find(a => search.test(a))) && tag !== "") this.tagList.push(tag);
      }
      const search = new RegExp(map.username, 'i')
      if (!this.userList.find(a => search.test(a)) && map.username !== "") this.userList.push(map.username);
    });
  }

  openFilterWindow() {
    this.bottomSheet.open(MapFilterComponent, {
      data: {
        tagList: this.tagList,
        userList: this.userList,
        addTag: this.addTag.bind(this),
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
    const rand = Math.floor(Math.random() * maps.length);
    this.ss.save({
      id: this.setting.id,
      name: this.setting.name,
      value: id < 0 ? maps[rand].id : id,
      group: this.setting.group,
      data: id < 0 ? maps[rand].name : "Generated",
    });
    this.selectedMap = await this.ss.get(this.setting.group, this.setting.name);
  }

  filter() {
    if (this.data === "" || this.data === undefined) this.maplist.next(this.servermapList);
    this.maplist.next(this.servermapList.filter(map => {
      const search = new RegExp(this.data, 'i');
      const tag = map.tags.some(tag => search.test(tag));
      if (this.selectedFilters.length > 0) {
        const selectedTags = this.selectedFilters.filter(element => map.tags.includes(element) || (element === map.username && search.test(map.name) ||
          +element <= map.ratingAverage)).length > 0;
        return search.test(map.name) && selectedTags || search.test(map.username) && selectedTags || tag && selectedTags;
      }
      return search.test(map.name) || search.test(map.username) || tag;
    }));
  }

  removeTag(tag: string): void {
    const index = this.selectedFilters.indexOf(tag);

    if (index >= 0) {
      this.selectedFilters.splice(index, 1);
    }
    this.filter();
  }

  addTag(tag: string): void {
    const searchTags = new RegExp(tag, 'i');
    if (this.selectedFilters.find(a => searchTags.test(a))) return;
    this.selectedFilters.push(tag);
    this.filter();
  }

  sort(value: string) {
    switch (value) {
      case this.sortList[0]: this.maplist.next(this.servermapList.sort((n1, n2) => 
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 : (n1.ratingAverage || Number.MIN_VALUE) - (n2.ratingAverage || Number.MIN_VALUE)))); break;
      case this.sortList[1]: this.maplist.next(this.servermapList.sort((n1, n2) => 
        n1.id <= 1 ? -1 : (n2.id <= 1 ? 1 :  (n2.ratingAverage || Number.MIN_VALUE) - (n1.ratingAverage || Number.MIN_VALUE)))); break;
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
