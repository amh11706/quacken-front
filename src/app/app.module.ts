import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { FriendsModule } from './chat/friends/friends.module';
import { LoginModule } from './login/login.module';
import { SettingsModule } from './settings/settings.module';
import { ChatModule } from './chat/chat.module';
import { InventoryModule } from './inventory/inventory.module';

import { AppComponent } from './app.component';
import { RecordComponent } from './record/record.component';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [AppComponent, RecordComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,

    LoginModule,
    FriendsModule,
    SettingsModule,
    ChatModule,
    InventoryModule,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
