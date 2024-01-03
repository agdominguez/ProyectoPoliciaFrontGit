import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbsComponent } from './breadcrumbs/breadcrumbs.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginatorComponent } from './paginator/paginator.component';
import { ModalFooterComponent } from './modal-footer/modal-footer.component';
import { ModalHeaderComponent } from './modal-header/modal-header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [
    BreadcrumbsComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    PaginatorComponent,
    ModalFooterComponent,
    ModalHeaderComponent
  ],
  exports:[
    BreadcrumbsComponent,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    PaginatorComponent,
    ModalFooterComponent,
    ModalHeaderComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
