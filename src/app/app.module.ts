import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

import { AppComponent } from './app.component';
import { RecordComponent } from './record/record.component';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';

const customTooltipDefaults: MatTooltipDefaultOptions = {
  showDelay: 0,
  hideDelay: 0,
  touchendHideDelay: 1500,
  position: 'above',
};

@NgModule({
  declarations: [AppComponent, RecordComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
  ],
  providers: [
    { provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: customTooltipDefaults }
  ],
  bootstrap: [AppComponent],
})

export class AppModule { }
