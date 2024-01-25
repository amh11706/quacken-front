import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { TitleCasePipe } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatLegacyAutocompleteSelectedEvent as MatAutocompleteSelectedEvent } from '@angular/material/legacy-autocomplete';
import { MatLegacyChipInputEvent as MatChipInputEvent } from '@angular/material/legacy-chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'q-tags',
  templateUrl: './tags.component.html',
  styleUrls: ['./tags.component.scss'],
})
export class TagsComponent {
  visible = true;
  selectable = true;
  removable = true;
  @Output() chipChange = new EventEmitter<boolean>();
  separatorKeysCodes: number[] = [ENTER, COMMA];
  tagCtrl = new UntypedFormControl();
  filteredTags: Observable<string[]>;
  tags: string[] = [];
  allTags: string[] = ['1v1', '2v2', '3v3', '4v4+', 'Brigs', 'Cage', 'Frigs', 'Maze', 'Practice'];
  titleCasePipe = new TitleCasePipe();
  constructor() {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((tag: string | null) => tag ? this._filter(tag) : this.allTags.slice()));
  }

  add(event: MatChipInputEvent): void {
    const value = this.titleCasePipe.transform((event.value || '').trim());
    const search = new RegExp(value, 'i');
    if (this.tags.find(a => search.test(a)) || !this.allTags.find(tag => search.test(tag))) return;
    if (value) {
      this.tags.push(value);
    }
    event.chipInput?.clear();

    this.tagCtrl.setValue(null);
    this.chipChange.emit(true);
  }

  remove(fruit: string): void {
    const index = this.tags.indexOf(fruit);

    if (index >= 0) {
      this.tags.splice(index, 1);
    }
    this.chipChange.emit(true);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    const value = event.option.viewValue;
    const search = new RegExp(value, 'i');
    if (this.tags.find(a => search.test(a))) return;
    this.tags.push(value);
    this.tagCtrl.setValue(null);
    this.chipChange.emit(true);
  }

  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.allTags.filter(tag => tag.toLowerCase().indexOf(filterValue) === 0);
  }

  addAll(mapTags: string[]): void {
    this.tags = [];
    mapTags.forEach(mapTag => this.tags.push(mapTag));
  }
}
