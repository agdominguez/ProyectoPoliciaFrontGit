import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  menu: any[] = [
    {
      titulo: 'Administración',
      icono: 'fas fa-caret-right',
      submenu: [
        { titulo: 'Dependencias', url: 'dependencia', icon: 'fas fa-map-marked-alt' },
        { titulo: 'Flota Vehicular', url: 'flotaVehicular', icon: 'fas fa-car-side' },
        { titulo: 'Personal Policial', url: 'personalPolicial', icon: 'fas fa-users' },
      ]
    },
    {
      titulo: 'Mantenimiento',
      icono: 'fas fa-caret-right',
      submenu: [
        { titulo: 'Vinculación Personal', url: 'vinculacionPersonalSubCircuito', icon: 'fas fa-street-view' },
        { titulo: 'Vinculación Flota', url: 'vinculacionFlotaSubCircuito', icon: 'fas fa-truck' },
        { titulo: 'Solicitud', url: 'solicitud', icon: 'fas fa-envelope-open-text' },
        { titulo: 'Vinculacion', url: 'vinculacion', icon: 'fas fa-user-tag' },
        { titulo: 'Mantenimiento', url: 'mantenimiento', icon: 'fas fa-tools' },
        { titulo: 'Orden Trabajo', url: 'ordenTrabajo', icon: 'fas fa-clipboard-list' }
      ]
    },
    {
      titulo: 'Pertrechos',
      icono: 'fas fa-caret-right',
      submenu: [
        { titulo: 'Armamento', url: 'armamento', icon: 'fas fa-street-view' },
        { titulo: 'Dotacion', url: 'asignacionArmas', icon: 'fas fa-street-view' },
      ]
    },
    {
      titulo: 'Reportes',
      icono: 'fas fa-caret-right',
      submenu: [
         { titulo: 'Sugerencias', url: 'sugerencia', icon: 'fas fa-mail-bulk' },
      ]
    }
  ];

  constructor() { }

}
