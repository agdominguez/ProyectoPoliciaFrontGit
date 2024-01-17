import { NgModule, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanActivateFn, RouterModule, Routes } from '@angular/router';
import { PagesRoutingModule } from './pages/pages-routing.module';
import { PrincipalComponent } from './pages/principal/principal.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AuthGuard } from './authentication/auth.guard';
import { SugerenciasComponent } from './sugerencias/sugerencias.component';

const isAuthenticated: CanActivateFn = (route, state) => {
  return inject(AuthGuard).isAccessAllowed(route, state);
}
const routes: Routes = [
  { path: '', component: PrincipalComponent },
  { path: 'dashboard', component:DashboardComponent, canActivate:[isAuthenticated] },
  { path: 'sugerencias', component:SugerenciasComponent },
];

@NgModule({
  declarations: [],
  imports: [
    RouterModule.forRoot(routes),
    CommonModule,
    PagesRoutingModule
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
