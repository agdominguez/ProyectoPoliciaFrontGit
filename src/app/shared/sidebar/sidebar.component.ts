import { AfterViewInit, Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/authentication/auth.service';
import { SidebarService } from 'src/app/services/sidebar.service';
declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, AfterViewInit {

  menuItems: any[];

  constructor(private sidebarService: SidebarService,
    private authService: AuthService) {
    this.menuItems = this.sidebarService.menu;
    this.initTreeview();
  }

  ngOnInit() {
    // Inicializa Treeview después de que Angular haya renderizado el componente.
    // Utiliza setTimeout para asegurarte de que esto ocurra después del ciclo de detección de cambios.

    setTimeout(() => {
      this.initTreeview();
    });
  }

  ngAfterViewInit() {
    // En caso de que haya otras inicializaciones necesarias después de la vista.
    // Puedes mover la llamada a initTreeview() aquí si es necesario.
    setTimeout(() => {
      this.initTreeview();
    });
  }

  private initTreeview() {
    // Llamada a Treeview para inicializar el menú desplegable.
    $('[data-widget="treeview"]').Treeview();
  }

  logout() {
    this.authService.logout()
  }

}
