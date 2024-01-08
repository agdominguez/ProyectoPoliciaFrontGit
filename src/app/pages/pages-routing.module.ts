import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DependenciaComponent } from './list/dependencias/dependencia/dependencia.component';
import { FlotaVehicularComponent } from './list/flotas/flota-vehicular/flota-vehicular.component';
import { PersonalPolicialComponent } from './list/personas/personal-policial/personal-policial.component';
import { VinculacionFlotaSubCircuitoComponent } from './list/flotas/vinculacion-flota-sub-circuito/vinculacion-flota-sub-circuito.component';
import { VinculacionPersonalSubCircuitoComponent } from './list/personas/vinculacion-personal-sub-circuito/vinculacion-personal-sub-circuito.component';
import { SolicitudComponent } from './list/mantenimientos/solicitud/solicitud.component';

const routes: Routes = [

  {
    path: 'dashboard', component: PagesComponent,
    children: [
      { path: '', component: DashboardComponent, data: { titulo: 'Dashboard' } },
      { path: 'dependencia', component: DependenciaComponent, data: { titulo: 'Dependencias' } },
      { path: 'dependencia/page/:page', component: DependenciaComponent, data: { titulo: 'Dependencias' } },
      { path: 'flotaVehicular', component: FlotaVehicularComponent, data: { titulo: 'Flota Vehicular' } },
      { path: 'flotaVehicular/page/:page', component: FlotaVehicularComponent, data: { titulo: 'Flota Vehicular' } },
      { path: 'personalPolicial', component: PersonalPolicialComponent, data: { titulo: 'Personal Policial' } },
      { path: 'personalPolicial/page/:page', component: PersonalPolicialComponent, data: { titulo: 'Personal Policial' } },
      { path: 'vinculacionFlotaSubCircuito', component: VinculacionFlotaSubCircuitoComponent, data: { titulo: 'Vinculacion Flota SubCircuito' } },
      { path: 'vinculacionFlotaSubCircuito/page/:page', component: VinculacionFlotaSubCircuitoComponent, data: { titulo: 'Vinculacion Flota SubCircuito' } },
      { path: 'vinculacionPersonalSubCircuito', component: VinculacionPersonalSubCircuitoComponent, data: { titulo: 'Vinculacion Personal SubCircuito' } },
      { path: 'vinculacionPersonalCircuito/page/:page', component: VinculacionPersonalSubCircuitoComponent, data: { titulo: 'Vinculacion Personal SubCircuito' } },
      { path: 'solicitud', component: SolicitudComponent, data: { titulo: 'Solicitud Mantenimiento' } },
      { path: 'solicitud/page/:page', component: SolicitudComponent, data: { titulo: 'Solicitud Mantenimiento' } },
    ]
  }
]
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports:[
    RouterModule
  ]
})
export class PagesRoutingModule { }
