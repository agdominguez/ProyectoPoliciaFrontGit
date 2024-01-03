import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PagesComponent } from './pages.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DependenciasComponent } from './list/dependencias/dependencias.component';
import { FlotaVehicularComponent } from './list/flota-vehicular/flota-vehicular.component';
import { PersonalPolicialComponent } from './list/personas/personal-policial/personal-policial.component';

const routes: Routes = [

  {
    path: 'dashboard', component: PagesComponent,
    children: [
      { path: '', component: DashboardComponent, data: { titulo: 'Dashboard' } },
      { path: 'dependencias', component: DependenciasComponent, data: { titulo: 'Dependencias' } },
      { path: 'dependencias/page/:page', component: DependenciasComponent, data: { titulo: 'Dependencias' } },
      { path: 'flotaVehicular', component: FlotaVehicularComponent, data: { titulo: 'Flota Vehicular' } },
      { path: 'flotaVehicular/page/:page', component: FlotaVehicularComponent, data: { titulo: 'Flota Vehicular' } },
      { path: 'personalPolicial', component: PersonalPolicialComponent, data: { titulo: 'Personal Policial' } },
      { path: 'personalPolicial/page/:page', component: PersonalPolicialComponent, data: { titulo: 'Personal Policial' } },
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
