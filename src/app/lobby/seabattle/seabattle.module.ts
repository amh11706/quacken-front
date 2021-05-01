import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeabattleComponent } from './seabattle.component';
import { CadegooseModule } from '../cadegoose/cadegoose.module';
import { SbEntryStatusComponent } from './sb-entry-status/sb-entry-status.component';
import { SbStatsComponent } from './sb-stats/sb-stats.component';
import { SbMainMenuComponent } from './sb-main-menu/sb-main-menu.component';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { ChatModule } from 'src/app/chat/chat.module';
import { NameModule } from 'src/app/chat/name/name.module';
import { QdragModule } from 'src/app/qdrag/qdrag.module';
import { SettingsModule } from 'src/app/settings/settings.module';
import { QuackenModule } from '../quacken/quacken.module';
import { TwodRenderModule } from '../cadegoose/twod-render/twod-render.module';



@NgModule({
  declarations: [SeabattleComponent, SbEntryStatusComponent, SbStatsComponent, SbMainMenuComponent],
  imports: [
    CommonModule,
    CadegooseModule,
    TwodRenderModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    QdragModule,
    ChatModule,
    SettingsModule,
    QuackenModule,
    NameModule,
  ],
  exports: [SeabattleComponent]
})
export class SeabattleModule { }
