import { Component, EventEmitter, OnDestroy, OnInit, Output} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, map, startWith } from 'rxjs/operators';

@Component({
  selector: 'q-map-input-search',
  templateUrl: './map-input-search.component.html',
  styleUrls: ['./map-input-search.component.scss']
})
export class MapInputSearchComponent implements OnInit, OnDestroy{
  inputCtrl = new FormControl();
  @Output() data = new EventEmitter<string>();
  @Output() backspace = new EventEmitter<string>();
  sub = new Subscription();
  
  constructor() {
  }
  
  ngOnInit(): void {
    this.sub.add(this.inputCtrl.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe(data => this.data.emit(data)));
  }

  ngOnDestroy(): void{
      this.sub.unsubscribe();
  }

  filter(){
    this.backspace.emit("")
  }
}
