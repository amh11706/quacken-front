import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TeamImages } from '../../../../lobby/cadegoose/types';
import { TeamPlayer } from '../../types';

@Component({
    selector: 'q-team-view',
    templateUrl: './teams.component.html',
    styleUrls: ['./teams.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class TeamsComponent {
  @Input() teams: TeamPlayer[][] = [];
  @Input() playerLength = 0;
  showTeams = false;
  teamImages = Object.values(TeamImages);
}
