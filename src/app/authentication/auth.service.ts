
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import {from, Observable} from 'rxjs';

export interface AuthConfig {
  redirectUrlLogin: string;
  redirectUrlLogout: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isAuthenticated() {
    throw new Error('Method not implemented.');
  }

  keycloak = inject(KeycloakService);

  constructor(private keycloakService: KeycloakService, private router: Router) {
    this.keycloak.isLoggedIn().then((loggedIn) => {
      if (loggedIn) {
        this.keycloak.getKeycloakInstance().loadUserProfile();
      }
    });
  }

  public logout(): void {
    this.keycloak.logout("http://localhost:4200/").then();
  }

  login() {
    this.keycloak.login({redirectUri: "http://localhost:4200/dashboard"}).then();
  }


  isLoggedIn(): Promise<boolean> {
    return this.keycloak.isLoggedIn();
  }

  getUsername(): string {
    return this.keycloak.getKeycloakInstance()?.profile?.username as string;
  }

  getId(): string {
    return this.keycloak?.getKeycloakInstance()?.profile?.id as string;
  }

  getTokenExpirationDate(): number {
    return (this.keycloak.getKeycloakInstance().refreshTokenParsed as { exp: number })['exp'] as number;
  }

  refresh(): Observable<any> {
    return from(this.keycloak.getKeycloakInstance().updateToken(1800));
  }

  isExpired(): boolean {
    return this.keycloak.getKeycloakInstance().isTokenExpired();
  }

  initializeKeycloak() {
    return this.keycloakService.init({
      config: {
        url: 'http://localhost:9090',
        realm: 'login-policia',
        clientId: 'spring-security-keycloak',
      },
      initOptions: {
        onLoad: 'login-required',
        checkLoginIframe: true,
        checkLoginIframeInterval: 25,
      },
    });
  }

  handleAuthentication(): Promise<any> {
    return this.keycloakService.getToken().then((token) => {
      // Redirigir al dashboard u otra página después de autenticarse
      return Promise.resolve(); // Puedes retornar algo aquí si es necesario
    });
  }
}
