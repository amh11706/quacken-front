import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { LoginComponent } from './login.component';
import { PrivacyComponent } from './privacy/privacy.component';
import { ResetComponent } from './reset/reset.component';
import { RestoreComponent } from './restore/restore.component';
import { TermsComponent } from './terms/terms.component';


const routes: Routes = [
    {
        path: '',
        component: LoginComponent,
        children: [
            {
                path: 'login',
                component: LoginFormComponent,
            },
            {
                path: 'terms',
                component: TermsComponent,
            },
            {
                path: 'privacy',
                component: PrivacyComponent,
            },
            {
                path: 'create',
                component: CreateComponent,
            },
            {
                path: 'reset/:token',
                component: ResetComponent,
            },
            {
                path: 'restore/:token',
                component: RestoreComponent,
            },
            {
                path: '**',
                redirectTo: 'login',
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LoginRoutingModule { }
