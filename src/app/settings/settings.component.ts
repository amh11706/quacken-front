import { Component, OnInit, Input, TemplateRef, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  @Input() settingTemplate: TemplateRef<any>;
  @Output() close = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

}
