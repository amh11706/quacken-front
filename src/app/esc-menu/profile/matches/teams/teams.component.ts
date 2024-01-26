import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { TeamImages } from '../../../../chat/chat.service';

export interface TeamPlayer {
  from: string;
  team: keyof typeof TeamImages;
}

@Component({
  selector: 'q-team-view',
  templateUrl: './teams.component.html',
  styleUrls: ['./teams.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamsComponent {
  @Input() teams: TeamPlayer[][] = [];
  @Input() playerLength = 0;
  showTeams = false;
  teamImages = Object.values(TeamImages);
}
