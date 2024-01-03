import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  menu: any[] = [{
    titulo: 'Dashboard',
    icono: 'nav-icon fas fa-tachometer-alt',
    submenu: [
      { titulo: 'Dependencias', url: 'dependencias', icon: 'fas fa-map-marked-alt' },
      { titulo: 'Flota Vehicular', url: 'flotaVehicular', icon: 'fas fa-car-side' },
      { titulo: 'PersonalPolicial', url: 'personalPolicial', icon: 'fas fa-car-side' }
    ]
  }];

  constructor() { }
}
