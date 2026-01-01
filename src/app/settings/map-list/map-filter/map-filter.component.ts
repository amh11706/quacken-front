import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';

@Component({
  selector: 'q-map-filter',
  templateUrl: './map-filter.component.html',
  styleUrl: './map-filter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class MapFilterComponent {
  filterRef = inject<MatBottomSheetRef<MapFilterComponent>>(MatBottomSheetRef);
  data = inject<{
    tagList: string[];
    userList: string[];
    toggleTag: (v: string) => void;
  }>(MAT_BOTTOM_SHEET_DATA);

  onClick(filterOption: string): void {
    this.data.toggleTag(filterOption);
  }
}
