import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login.component';
import { CreateComponent } from './create/create.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { TermsComponent } from './terms/terms.component';
import { ResetComponent } from './reset/reset.component';
import { RestoreComponent } from './restore/restore.component';
import { AutoSelectModule } from '../autoselect/autoselect.module';
import { LoginRoutingModule } from './login-routing.module';
import { LoginFormComponent } from './login-form/login-form.component';

@NgModule({
  declarations: [
    LoginComponent,
    CreateComponent,
    PrivacyComponent,
    TermsComponent,
    ResetComponent,
    RestoreComponent,
    LoginFormComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    LoginRoutingModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDialogModule,
    AutoSelectModule,
  ],
})
export class LoginModule { }
