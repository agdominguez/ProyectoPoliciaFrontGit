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
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { VinculacionFlotaSubCircuitoComponent } from './list/flotas/vinculacion-flota-sub-circuito/vinculacion-flota-sub-circuito.component';
import { VinculacionPersonalSubCircuitoComponent } from './list/dependencias/vinculacion-personal-sub-circuito/vinculacion-personal-sub-circuito.component';
import { SolicitudComponent } from './list/mantenimientos/solicitud/solicitud.component';
import { PrincipalComponent } from './principal/principal.component';
import { ModalVinculacionPersonalSubcircuitoComponent } from './forms/forms-dependencias/modal-vinculacion-personal-subcircuito/modal-vinculacion-personal-subcircuito.component';
import {MatListModule} from '@angular/material/list';
import { ModalVinculacionFlotaSubcircuitoComponent } from './forms/forms-flotas/modal-vinculacion-flota-subcircuito/modal-vinculacion-flota-subcircuito.component';
import { VinculacionComponent } from './list/mantenimientos/vinculacion/vinculacion.component';
import { ModalVinculacionComponent } from './forms/forms-mantenimientos/modal-vinculacion/modal-vinculacion.component';
import { ModalSolicitudComponent } from './forms/forms-mantenimientos/modal-solicitud/modal-solicitud.component';
import { MatStepperModule } from '@angular/material/stepper';
import {MatCardModule} from '@angular/material/card';
import { MantenimientoComponent } from './list/mantenimientos/mantenimiento/mantenimiento.component';
import { ModalMantenimientoComponent } from './forms/forms-mantenimientos/modal-mantenimiento/modal-mantenimiento.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import { ReporteSugerenciaComponent } from './list/reportes/reporte-sugerencia/reporte-sugerencia.component';
import { OrdenTrabajoComponent } from './list/mantenimientos/orden-trabajo/orden-trabajo.component';
import { ModalOrdenTrabajoComponent } from './forms/forms-mantenimientos/modal-orden-trabajo/modal-orden-trabajo.component';
import { ArmamentoComponent } from './list/mantenimientos/armamento/armamento.component';
import { ModalArmamentoComponent } from './forms/forms-mantenimientos/modal-armamento/modal-armamento.component';
import { ModalAsignacionArmamentoComponent } from './forms/forms-mantenimientos/modal-asignacion-armamento/modal-asignacion-armamento.component';
import { AsignacionArmasComponent } from './list/mantenimientos/asignacion-armas/asignacion-armas.component';

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
    SolicitudComponent,
    PrincipalComponent,
    ModalVinculacionPersonalSubcircuitoComponent,
    ModalVinculacionFlotaSubcircuitoComponent,
    VinculacionComponent,
    ModalVinculacionComponent,
    ModalSolicitudComponent,
    MantenimientoComponent,
    ModalMantenimientoComponent,
    ReporteSugerenciaComponent,
    OrdenTrabajoComponent,
    ModalOrdenTrabajoComponent,
    ArmamentoComponent,
    ModalArmamentoComponent,
    ModalAsignacionArmamentoComponent,
    AsignacionArmasComponent
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
    MatNativeDateModule,
    MatListModule,
    MatOptionModule,
    MatStepperModule,
    MatCardModule,
    MatTooltipModule
  ]
})
export class PagesModule { }
