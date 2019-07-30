import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { FriendsModule } from './chat/friends/friends.module';
import { ListModule } from './list/list.module';
import { LobbyModule } from './lobby/lobby.module';
import { LoginModule } from './login/login.module';
import { SettingsModule } from './settings/settings.module';
import { MapEditorModule } from './map-editor/map-editor.module';
import { ChatModule } from './chat/chat.module';

import { AppComponent } from './app.component';

import { WsService } from './ws.service';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,

    FriendsModule,
    ListModule,
    LobbyModule,
    LoginModule,
    SettingsModule,
    MapEditorModule,
    ChatModule,
  ],
  providers: [WsService],
  bootstrap: [AppComponent]
})
export class AppModule { }
