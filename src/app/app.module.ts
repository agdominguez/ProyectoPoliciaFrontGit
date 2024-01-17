import { KeycloakService, KeycloakAngularModule } from 'keycloak-angular';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { PagesModule } from './pages/pages.module';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { SugerenciasComponent } from './sugerencias/sugerencias.component';

// function initializeKeycloak(keycloak: KeycloakService) {
//   console.log('keycloak profile will be loading...')
//   return () =>
//     keycloak.init({
//       config: {
//         url: 'http://localhost:9090',
//         realm: 'login-policia',
//         clientId: 'spring-security-keycloak'
//       },
//       initOptions: {
//         onLoad: 'login-required',
//         checkLoginIframe: true,
//         checkLoginIframeInterval: 25
//         //onLoad: 'check-sso'
//       }
//     });
// }

@NgModule({
  declarations: [
    AppComponent,
    SugerenciasComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    PagesModule,
    MatDialogModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    MatAutocompleteModule,
    KeycloakAngularModule
  ],
  providers: [
    // {
    //   provide: APP_INITIALIZER,
    //   useFactory: initializeKeycloak,
    //   multi: true,
    //   deps: [KeycloakService]
    // }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
