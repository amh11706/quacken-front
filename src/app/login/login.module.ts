import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyDialogModule as MatDialogModule } from '@angular/material/legacy-dialog';

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
