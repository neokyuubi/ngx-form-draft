import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { NgxFormDraftModule } from 'ngx-form-draft';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { ReactiveFormComponent } from './reactive-form/reactive-form.component';
import { TemplateFormComponent } from './template-form/template-form.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'reactive', component: ReactiveFormComponent },
  { path: 'template', component: TemplateFormComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ReactiveFormComponent,
    TemplateFormComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    NgxFormDraftModule,
    RouterModule.forRoot(routes, { useHash: true }),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
