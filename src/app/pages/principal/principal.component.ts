import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/authentication/auth.service';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent {

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


}
