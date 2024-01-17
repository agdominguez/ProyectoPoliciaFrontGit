import { NgModule, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanActivateFn, RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DependenciaComponent } from './list/dependencias/dependencia/dependencia.component';
import { FlotaVehicularComponent } from './list/flotas/flota-vehicular/flota-vehicular.component';
import { PersonalPolicialComponent } from './list/personas/personal-policial/personal-policial.component';
import { VinculacionFlotaSubCircuitoComponent } from './list/flotas/vinculacion-flota-sub-circuito/vinculacion-flota-sub-circuito.component';
import { VinculacionPersonalSubCircuitoComponent } from './list/dependencias/vinculacion-personal-sub-circuito/vinculacion-personal-sub-circuito.component';
import { SolicitudComponent } from './list/mantenimientos/solicitud/solicitud.component';
import { AuthGuard } from '../authentication/auth.guard';
import { VinculacionComponent } from './list/mantenimientos/vinculacion/vinculacion.component';
import { MantenimientoComponent } from './list/mantenimientos/mantenimiento/mantenimiento.component';
import { ReporteSugerenciaComponent } from './list/reportes/reporte-sugerencia/reporte-sugerencia.component';

const isAuthenticated: CanActivateFn = (route, state) => {
  return inject(AuthGuard).isAccessAllowed(route, state);
}
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
      { path: 'vinculacion', component: VinculacionComponent, data: { titulo: 'Vinculacion' } },
      { path: 'vinculacion/page/:page', component: VinculacionComponent, data: { titulo: 'Vinculacion' } },
      { path: 'mantenimiento', component: MantenimientoComponent, data: { titulo: 'Mantenimiento' } },
      { path: 'mantenimiento/page/:page', component: MantenimientoComponent, data: { titulo: 'Mantenimiento' } },
      { path: 'sugerencia', component: ReporteSugerenciaComponent, data: { titulo: 'Sugerencias' } },
      { path: 'sugerencia/page/:page', component: ReporteSugerenciaComponent, data: { titulo: 'Sugerencias' } },
    ]


  }
]


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class PagesRoutingModule { }
