import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  menu: any[] = [
    {
      titulo: 'Dashboard',
      icono: 'nav-icon fas fa-tachometer-alt',
      submenu: [
        { titulo: 'Dependencias', url: 'dependencia', icon: 'fas fa-map-marked-alt' },
        { titulo: 'Flota Vehicular', url: 'flotaVehicular', icon: 'fas fa-car-side' },
        { titulo: 'Personal Policial', url: 'personalPolicial', icon: 'fas fa-users' },
        { titulo: 'Vinculación Personal', url: 'vinculacionPersonalSubCircuito', icon: 'fas fa-street-view' },
        { titulo: 'Vinculación Flota', url: 'vinculacionFlotaSubCircuito', icon: 'fas fa-truck' },
        { titulo: 'Solicitud', url: 'solicitud', icon: 'fas fa-envelope-open-text' },
        { titulo: 'Vinculacion', url: 'vinculacion', icon: 'fas fa-truck' },
        { titulo: 'Mantenimiento', url: 'mantenimiento', icon: 'fas fa-envelope-open-text' },
        { titulo: 'Sugerencias', url: 'sugerencia', icon: 'fas fa-envelope-open-text' }
      ]
    }
  ];

  constructor() { }

}
