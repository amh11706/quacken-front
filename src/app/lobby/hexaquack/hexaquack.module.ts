import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HexaquackComponent } from './hexaquack.component';
import { QuackenModule } from '../quacken/quacken.module';
import { QdragModule } from 'src/app/qdrag/qdrag.module';
import { ChatModule } from 'src/app/chat/chat.module';
import { SettingsModule } from 'src/app/settings/settings.module';



@NgModule({
  declarations: [HexaquackComponent],
  imports: [
    CommonModule,
    QuackenModule,
    QdragModule,
    ChatModule,
    SettingsModule,
  ],
  exports: [HexaquackComponent],
})
export class HexaquackModule { }
