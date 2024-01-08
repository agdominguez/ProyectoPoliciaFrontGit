import { MatFormFieldModule } from '@angular/material/form-field';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PagesComponent } from './pages.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { DependenciaComponent } from './list/dependencias/dependencia/dependencia.component';
import { FlotaVehicularComponent } from './list/flotas/flota-vehicular/flota-vehicular.component';
import { ModalFlotaVehicularComponent } from './forms/forms-flotas/modal-flota-vehicular/modal-flota-vehicular.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { ModalDependenciaComponent } from './forms/forms-dependencias/modal-dependencia/modal-dependencia.component';
import { PersonalPolicialComponent } from './list/personas/personal-policial/personal-policial.component';
import { ModalPersonalPolicialComponent } from './forms/forms-personas/modal-personal-policial/modal-personal-policial.component';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from '@angular/material/core';
import { VinculacionFlotaSubCircuitoComponent } from './list/flotas/vinculacion-flota-sub-circuito/vinculacion-flota-sub-circuito.component';
import { VinculacionPersonalSubCircuitoComponent } from './list/personas/vinculacion-personal-sub-circuito/vinculacion-personal-sub-circuito.component';
import { SolicitudComponent } from './list/mantenimientos/solicitud/solicitud.component';

@NgModule({
  declarations: [
    DashboardComponent,
    PagesComponent,
    DependenciaComponent,
    FlotaVehicularComponent,
    ModalFlotaVehicularComponent,
    ModalDependenciaComponent,
    PersonalPolicialComponent,
    ModalPersonalPolicialComponent,
    VinculacionFlotaSubCircuitoComponent,
    VinculacionPersonalSubCircuitoComponent,
    SolicitudComponent
  ],
  exports:[
    DashboardComponent,
    PagesComponent,
    DependenciaComponent,
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
    BrowserAnimationsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class PagesModule { }
