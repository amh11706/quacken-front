import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'q-exit-prompt',
    templateUrl: './exit-prompt.component.html',
    styleUrls: ['./exit-prompt.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class ExitPromptComponent {
}
