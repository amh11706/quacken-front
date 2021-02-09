import { Component } from '@angular/core';
import { BufferGeometry, Line, LineBasicMaterial, Object3D, Vector3 } from 'three';
import { BoatService } from '../cadegoose/boat.service';
import { CadegooseComponent, GRID_DEPTH } from '../cadegoose/cadegoose.component';
import { SbMainMenuComponent } from './sb-main-menu/sb-main-menu.component';

export const SbDesc = 'Sea Battle: Sink the enemy ship to win!';

@Component({
  selector: 'q-seabattle',
  templateUrl: './seabattle.component.html',
  styleUrls: ['./seabattle.component.scss'],
  providers: [BoatService],
})
export class SeabattleComponent extends CadegooseComponent {
  protected menuComponent = SbMainMenuComponent;
  protected mapHeight = 25;
  protected mapWidth = 25;
  protected joinMessage = SbDesc;

  protected buildGrid() {
    const grid = new Object3D();
    grid.position.y = GRID_DEPTH;
    let points: Vector3[] = [];
    for (let i = 0; i <= this.map[0].length; i++) {
      points.push(new Vector3(i, 0, 0));
    }
    let geometry = new BufferGeometry().setFromPoints(points);
    const material = new LineBasicMaterial({ color: '#aaa', fog: false });
    let line = new Line(geometry, material);
    for (let i = 0; i <= this.map.length; i++) {
      grid.add(line);
      line = line.clone();
      line.position.z++;
    }

    points = [];
    for (let i = 0; i <= this.map.length; i++) {
      points.push(new Vector3(0, 0, i));
    }
    geometry = new BufferGeometry().setFromPoints(points);
    line = new Line(geometry, material);
    for (let i = 0; i <= this.map[0].length; i++) {
      grid.add(line);
      line = line.clone();
      line.position.x++;
    }

    this.mapScene.add(grid);
  }

  protected updateIntersects() {

  }
}
