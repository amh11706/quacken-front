import { Component, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { OutCmd } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';
import { SettingsService } from '../settings.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MapFilterComponent } from './map-filter/map-filter.component';

interface MapOption {
  id: number
  description: string,
  name: string,
  released: boolean
  userId: number
  username: string,
  tags: string[],
  ratingAverage: number;
  ratingCount: number;
}

@Component({
  selector: 'q-map-list',
  templateUrl: './map-list.component.html',
  styleUrls: ['./map-list.component.scss']
})

export class MapListComponent implements OnInit {
  data: string = '';
  servermapList: MapOption[] = [];
  maplist = new ReplaySubject<MapOption[]>(1);

  selectedFilters: string[] = [];
  visible: boolean = true;
  selectable: boolean = true;
  removable: boolean = true;
  sortList: string[] = ["Ascending Avg. Rating","Descending Avg. Rating", "Ascending User", 
                        "Descending User", "Ascending Map Name", "Descending Map Name"];
  selectedSortOption: string = this.sortList[0];
  tagList: string[] = [];
  userList: string[] = [];
  setting = {
    admin: true, id: 18, group: 'l/cade', name: 'map', type: 'customMap', label: 'Custom Map', cmd: OutCmd.CgMapList
  }

  constructor(private bottomSheet: MatBottomSheet, public ws: WsService, public ss: SettingsService) { }

  openFilter() {
    this.bottomSheet.open(MapFilterComponent, {
      data: {
        tagList: this.tagList,
        userList: this.userList,
        addTag: this.addTag.bind(this),
      },
    });
  }

  async ngOnInit() {
    this.servermapList = await this.ws.request(OutCmd.CgMapList);
    // this.servermapList.unshift({ // generated map card
    //   id: 0,
    //   description: "",
    //   name: "Generated",
    //   released: false,
    //   userId: 0,
    //   username: "",
    // });
    this.servermapList.forEach((map)=> {
      for (let tag of map.tags){
        const search = new RegExp(tag, 'i')
        if (!this.tagList.find(a =>search.test(a))) this.tagList.push(tag);
      }
      const search = new RegExp(map.username, 'i')
      if (!this.userList.find(a =>search.test(a))) this.userList.push(map.username);
    });
    this.maplist.next(this.servermapList);
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
  }

  filter() {
    if (this.data === "" || this.data === undefined) this.maplist.next(this.servermapList);
    this.maplist.next(this.servermapList.filter(map => {
      const search = new RegExp(this.data, 'i');
      const tag = map.tags.some(tag => search.test(tag));
      if (this.selectedFilters.length > 0){
        const selectedTags = this.selectedFilters.filter(element => map.tags.includes(element) || (element === map.username && search.test(map.name))).length > 0;
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
    this.maplist.next(this.servermapList);
    this.filter();
  }

  addTag(tag: string): void {
    const searchTags = new RegExp(tag, 'i');
    if (this.selectedFilters.find(a =>searchTags.test(a))) return;
    this.selectedFilters.push(tag);
    this.filter();
  }

  sort(value: string){
    switch(value){
      case this.sortList[0]: this.maplist.next(this.servermapList.sort((n1,n2) => n1.ratingAverage > n2.ratingAverage ? 1 : -1)); break;
      case this.sortList[1]: this.maplist.next(this.servermapList.sort((n1,n2) => n1.ratingAverage > n2.ratingAverage ? -1 : 1)); break;
      case this.sortList[2]: this.maplist.next(this.servermapList.sort((n1,n2) => n1.username.toLowerCase() > n2.username.toLowerCase() ? 1 : -1)); break;
      case this.sortList[3]: this.maplist.next(this.servermapList.sort((n1,n2) => n1.username.toLowerCase() > n2.username.toLowerCase() ? -1 : 1)); break;
      case this.sortList[4]: this.maplist.next(this.servermapList.sort((n1,n2) => n1.name.toLowerCase() > n2.name.toLowerCase() ? 1 : -1)); break;
      case this.sortList[5]: this.maplist.next(this.servermapList.sort((n1,n2) => n1.name.toLowerCase() > n2.name.toLowerCase() ? -1 : 1)); break;
      default: this.maplist.next(this.servermapList);
    }
  }
  
}
