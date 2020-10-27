import { Component, OnInit } from '@angular/core';
import { Notes } from './notes';

@Component({
  selector: 'q-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss']
})
export class NewsComponent implements OnInit {
  notes = Notes;

  constructor() { }

  ngOnInit(): void {
  }

}
