import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { NgSelectModule } from '@ng-select/ng-select';

import { ChatModule } from '../chat/chat.module';
import { ListComponent } from './list.component';
import { SettingsModule } from '../settings/settings.module';
import { ListRoutingModule } from './list-routing.module';
import { CreateComponent } from './create/create.component';
import { NewsComponent } from './news/news.component';
import { LobbyCardComponent } from './lobby-card/lobby-card.component';
import { EditorErrorComponent } from './editor-error/editor-error.component';
import { LobbyListComponent } from './lobby-list/lobby-list.component';
import { FriendsModule } from '../chat/friends/friends.module';
import { EscMenuModule } from '../esc-menu/esc-menu.module';
import { NameModule } from '../chat/name/name.module';
import { CompetitionComponent } from './competition/competition.component';

@NgModule({
  declarations: [
    ListComponent,
    CreateComponent,
    NewsComponent,
    LobbyCardComponent,
    EditorErrorComponent,
    LobbyListComponent,
    CompetitionComponent,
  ],
  imports: [
    CommonModule,
    ListRoutingModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatMenuModule,
    MatCardModule,
    NgSelectModule,
    ChatModule,
    SettingsModule,
    FriendsModule,
    EscMenuModule,
    NameModule,
  ],
  exports: [ListComponent],
})
export class ListModule { }
