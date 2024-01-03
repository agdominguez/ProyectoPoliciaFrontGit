import { MatFormFieldModule } from '@angular/material/form-field';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PagesComponent } from './pages.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { DependenciasComponent } from './list/dependencias/dependencias.component';
import { FlotaVehicularComponent } from './list/flota-vehicular/flota-vehicular.component';
import { ModalFlotaVehicularComponent } from './forms/modal-flota-vehicular/modal-flota-vehicular.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ModalDependenciaComponent } from './forms/forms-dependencias/modal-dependencia/modal-dependencia.component';
import { PersonalPolicialComponent } from './list/personas/personal-policial/personal-policial.component';
import { ModalPersonalPolicialComponent } from './forms/forms-personas/modal-personal-policial/modal-personal-policial.component';


@NgModule({
  declarations: [
    DashboardComponent,
    PagesComponent,
    DependenciasComponent,
    FlotaVehicularComponent,
    ModalFlotaVehicularComponent,
    ModalDependenciaComponent,
    PersonalPolicialComponent,
    ModalPersonalPolicialComponent
  ],
  exports:[
    DashboardComponent,
    PagesComponent,
    DependenciasComponent,
    FlotaVehicularComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatIconModule,
    MatAutocompleteModule,
    BrowserAnimationsModule
  ]
})
export class PagesModule { }
