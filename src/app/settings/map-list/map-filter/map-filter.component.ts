import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'q-map-filter',
  templateUrl: './map-filter.component.html',
  styleUrls: ['./map-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MapFilterComponent {
  constructor(
    public filterRef: MatBottomSheetRef<MapFilterComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: {
      tagList: string[], userList: string[], toggleTag: (v: string) => void
    },
  ) { }

  onClick(filterOption: string): void {
    this.data.toggleTag(filterOption);
  }
}
