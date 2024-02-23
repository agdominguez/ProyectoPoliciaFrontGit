import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/authentication/auth.service';
import { DependenciaService } from 'src/app/services/services-dependencias/dependencia.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {

  constructor(private authService: AuthService, private router: Router) { }

  async onLoginClick() {
    try {
      // Inicializar Keycloak y esperar hasta que se complete
      await this.authService.initializeKeycloak();
      console.log('Keycloak initialized, perform other actions if needed');

      // Manejar la autenticación y esperar hasta que se complete
      await this.authService.handleAuthentication();

      // Redirigir al dashboard u otra página después de autenticarse
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Error durante la autenticación:', error);
    }
  }

  onLoginClick1(event: Event) {
    this.authService.initializeKeycloak();

      // Redirige al usuario a /dashboard
      this.router.navigate(['/index.html']);


    event.preventDefault();
  }
}
