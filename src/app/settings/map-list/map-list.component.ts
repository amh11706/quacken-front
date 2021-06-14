import { Component, Input, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { OutCmd } from 'src/app/ws-messages';
import { WsService } from 'src/app/ws.service';
import { SettingsService } from '../settings.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MapFilterComponent } from './map-filter/map-filter.component';
import { MatSelectChange } from '@angular/material/select';

interface MapOption {
  id: number
  description: string,
  name: string,
  released: boolean
  userId: number
  username: string,
  tags?: string[],
  ratingAverage?: number;
}

@Component({
  selector: 'q-map-list',
  templateUrl: './map-list.component.html',
  styleUrls: ['./map-list.component.scss']
})

export class MapListComponent implements OnInit {
  @Input() data: string = "";
  servermapList: MapOption[] = [];
  maplist = new ReplaySubject<MapOption[]>(1);

  selectedFilters: string [] = [];
  visible = true;
  selectable = true;
  removable = true;
  sortList: string[] = ["Avg. Rating", "User", "Map Name"];
  selectedSortOption = 'Avg. Rating';
  setting = {
    admin: true, id: 18, group: 'l/cade', name: 'map', type: 'customMap', label: 'Custom Map', cmd: OutCmd.CgMapList
  }

  constructor(private bottomSheet: MatBottomSheet, public ws: WsService, public ss: SettingsService) { }

  openFilter() {
    this.bottomSheet.open(MapFilterComponent, {
      data: {
        tagList: ["1v1", "2v2", "3v3", "4v4", "Flags", "Cade"],
        userList: ["Fatigue","CaptainVampi"],
        addTag: this.addTag.bind(this),
      },
    });
  }

  async ngOnInit() {
    this.servermapList = await this.ws.request(OutCmd.CgMapList);
    // this.servermapList.unshift({
    //   id: 0,
    //   description: "",
    //   name: "Generated",
    //   released: false,
    //   userId: 0,
    //   username: "",
    // });
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

  filter(data: string) {
    if (data === "" || undefined) return this.maplist.next(this.servermapList);
    this.maplist.next(this.servermapList.filter(map => {
      const search = new RegExp(data, 'i')
      return search.test(map.name) || search.test(map.username);
    }));
  }

  removeTag(tag: string): void {
    const index = this.selectedFilters.indexOf(tag);

    if (index >= 0) {
      this.selectedFilters.splice(index, 1);
    }
  }

  addTag(tag: string): void {
    if(this.selectedFilters.includes(tag)) return;
    this.selectedFilters.push(tag);
    this.filter(tag);
  }

  sort(value: string){
    // if(value === this.sortList[0]){
    //   this.maplist.next(this.servermapList.sort((n1,n2) => n1.ratingAverage! - n2.ratingAverage!));
    // };
    if(value === this.sortList[1]) {
      this.maplist.next(this.servermapList.sort((n1,n2) => {
        if (n1.username > n2.username) {
            return 1;
        }
    
        if (n1.username < n2.username) {
            return -1;
        }
    
        return 0;;
      }));
    };
    if(value === this.sortList[2]){
      this.maplist.next(this.servermapList.sort((n1,n2) => {
        if (n1.name > n2.name) {
            return 1;
        }
    
        if (n1.name < n2.name) {
            return -1;
        }
    
        return 0;;
      }));
    };
  }
  
}
