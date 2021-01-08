import { Component, Input, OnInit } from '@angular/core';
import { MapEditor } from '../map-editor.component';

@Component({
  selector: 'q-entity-editor',
  templateUrl: './entity-editor.component.html',
  styleUrls: ['./entity-editor.component.scss']
})
export class EntityEditorComponent implements OnInit {
  @Input() map?: MapEditor;

  constructor() { }

  ngOnInit(): void {
  }

}
