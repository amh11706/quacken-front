import { Component } from '@angular/core';
import { WsService } from '../../ws/ws.service';
import { BoatsService } from '../../lobby/quacken/boats/boats.service';
import { TurnService } from '../../lobby/quacken/boats/turn.service';
import { ReplayWrapperComponent } from '../../replay/lobby-wrapper/lobby-wrapper.component';

@Component({
  selector: 'q-lobby-wrapper',
  templateUrl: './lobby-wrapper.component.html',
  styleUrls: ['./lobby-wrapper.component.scss'],
  providers: [WsService, BoatsService, TurnService],
})
export class TrainingWrapperComponent extends ReplayWrapperComponent {
  // only used to change the providers from the replay wrapper
}
