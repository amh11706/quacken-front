import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Notes } from './notes';

@Component({
  selector: 'q-news',
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class NewsComponent {
  notes = Notes;
}
