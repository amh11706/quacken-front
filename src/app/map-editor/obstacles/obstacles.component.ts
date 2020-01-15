import { Component, OnInit, Input, ViewChild, OnDestroy } from '@angular/core';

import { MapEditor } from '../map-editor.component';

export const Titles = [
  'Cuttle Cake', 'Taco Locker', 'Pea Pod', 'Fried Egg',
  'Right Wind', 'Down Wind', 'Up Wind', 'Left Wind',
  'Whirl 1', 'Whirl 2', 'Whirl 3', 'Whirl 4',
  'Reverse Whirl 1', 'Reverse Whirl 2', 'Reverse Whirl 3', 'Reverse Whirl 4',
  'Rock', 'Fragile Rock'
];

@Component({
  selector: 'app-obstacles',
  templateUrl: './obstacles.component.html',
  styleUrls: ['./obstacles.component.css']
})
export class ObstaclesComponent implements OnInit, OnDestroy {
  @Input() map: MapEditor;
  @Input() background: HTMLElement;
  @ViewChild('selectedTile', { static: true }) selectedTile: HTMLElement;

  obstacles = [1, 2, 3, 4, 6, 7, 5, 8, 10, 11, 9, 12, 15, 16, 14, 13, 50];
  hexObstacles = [
    1, 2, 3, 4,
    5, 6, 7, 8, 9, 10,
    11, 12, 13, 14, 15, 16,
    35,
    50];
  scrollOrder = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16, 13, 50];
  titles = Titles;

  constructor() { }

  ngOnInit() {
    this.selectedTile = document.getElementById('selected');
    if (this.background) {
      this.background.addEventListener('mousemove', this.mouseMove);
      this.background.addEventListener('wheel', this.handleScroll);
    }
  }

  ngOnDestroy() {
    if (this.background) {
      this.background.removeEventListener('mousemove', this.mouseMove);
      this.background.removeEventListener('wheel', this.handleScroll);
    }
  }

  private mouseMove = (e: MouseEvent) => {
    this.selectedTile.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
  }

  private handleScroll = (e: WheelEvent) => {
    e.preventDefault();
    const scroll = this.map.hex ? this.hexObstacles : this.scrollOrder;
    const current = scroll.indexOf(this.map.selected);
    if (e.deltaY < 0) {
      this.map.selected = scroll[current + 1] || scroll[0];
    } else {
      this.map.selected = scroll[current - 1] || scroll[scroll.length - 1];
    }
  }

}
