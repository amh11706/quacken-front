import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA} from '@angular/material/bottom-sheet'

@Component({
  selector: 'q-map-filter',
  templateUrl: './map-filter.component.html',
  styleUrls: ['./map-filter.component.scss']
})
export class MapFilterComponent implements OnDestroy{

  selected: string[] = [];

  constructor(
    public filterRef: MatBottomSheetRef<MapFilterComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any) { }


  ngOnDestroy(): void {
    this.selected = [];
  }

  onClick(filterOption: string) {
    if (filterOption in this.selected) return;
    this.data.addTag(filterOption);
  }
  
}
