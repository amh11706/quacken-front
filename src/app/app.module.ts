import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  MatFormFieldModule,
  MatInputModule,
  MatButtonModule,
  MatDialogModule,
  MatIconModule,
  MatSliderModule,
  MatOptionModule,
  MatSelectModule,
  MatTabsModule,
  MatExpansionModule,
} from '@angular/material';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LoginComponent } from './login/login.component';
import { TermsComponent } from './login/terms/terms.component';
import { PrivacyComponent } from './login/privacy/privacy.component';

import { WsService } from './ws.service';
import { ChatService } from './chat/chat.service';
import { SettingsService } from './settings/settings.service';
import { ListComponent } from './list/list.component';
import { ChatComponent } from './chat/chat.component';
import { LobbyComponent } from './lobby/lobby.component';
import { BoatsComponent } from './lobby/boats/boats.component';
import { HudComponent } from './lobby/hud/hud.component';
import { EntryStatusComponent } from './lobby/entry-status/entry-status.component';
import { QdragDirective } from './qdrag.directive';
import { CreateComponent } from './login/create/create.component';
import { NameComponent } from './chat/name/name.component';
import { SettingsComponent } from './settings/settings.component';
import { FriendsComponent } from './chat/friends/friends.component';

@NgModule({
  entryComponents: [
    TermsComponent,
    PrivacyComponent
  ],
  declarations: [
    AppComponent,
    LoginComponent,
    TermsComponent,
    PrivacyComponent,
    ListComponent,
    ChatComponent,
    LobbyComponent,
    BoatsComponent,
    HudComponent,
    EntryStatusComponent,
    QdragDirective,
    CreateComponent,
    NameComponent,
    SettingsComponent,
    FriendsComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgbModule,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSliderModule,
    MatOptionModule,
    MatSelectModule,
    MatTabsModule,
    MatExpansionModule,
  ],
  providers: [WsService, ChatService, SettingsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
