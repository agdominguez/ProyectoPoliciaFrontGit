import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { FlotaVehicular } from 'src/app/entities/flotas/FlotaVehicular';
import { FlotaVehicularService } from 'src/app/services/flota-vehicular.service';
import { MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { ModalFlotaVehicularComponent } from '../../forms/modal-flota-vehicular/modal-flota-vehicular.component';

@Component({
  selector: 'app-flota-vehicular',
  templateUrl: './flota-vehicular.component.html',
  styleUrls: ['./flota-vehicular.component.css']
})
export class FlotaVehicularComponent implements OnInit {

  page!: number;
  pageSize: number = 10;
  flotaVehicularList!: FlotaVehicular[];
  paginador: any;
  flotaVehicularSelect!: FlotaVehicular;
  nombre: string = 'flotaVehicular';
  etiquetabtn: string = '+ Crear Nuevo';
  searchValue: string = '';
  private subscriptions: Subscription[] = [];
  sortColumn: string = ''; // Campo de ordenamiento actual
  sortDirection: string = 'asc'; // Orden actual ('asc' o 'desc')

  url?: string;

  constructor(
    private dialog: MatDialog,
    private flotaVehicularService: FlotaVehicularService,
    private activatedRoute: ActivatedRoute
  ) {
    this.url = this.activatedRoute.snapshot.parent?.url.join('/');
  }

  /**
   * Método que se ejecuta al inicializar el componente.
   */
  ngOnInit(): void {
    // Se suscribe al evento de cambio de parámetros de la URL para obtener el número de página actual
    const sub = this.activatedRoute.paramMap.subscribe(params => {
      if (params.has('page')) {
        let page: number = +params.get('page')!;
        if (isNaN(page) || page < 0) {
          page = 0;
        }
        this.page = page;
      } else {
        this.page = 0;
      }

      // Obtiene la lista de flotaVehicularList sin eliminar para la página actual
      this.obtenerListaNoEliminadaOrdenada(this.sortColumn, this.sortDirection);
    });
    this.subscriptions.push(sub);
  }

  /**
   * Método que se ejecuta al destruir el componente.
   */
  ngOnDestroy(): void {
    // Se desuscriben todas las suscripciones para evitar posibles fugas de memoria
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Método que obtiene la lista de tiposTelefono no eliminados para la página actual con ordenamiento.
   */
  obtenerListaNoEliminadaOrdenada(sortColumn: string, sortDirection: string): void {
    // Realiza una solicitud al servicio para obtener la lista de tiposTelefono no eliminados con ordenamiento
    const sub: Subscription = this.flotaVehicularService.getNotDeletedOrdered(this.pageSize, this.page, sortColumn, sortDirection).subscribe({
      next: (response: any) => {
        // Se procesa la respuesta y se actualiza el componente con los datos recibidos
        this.flotaVehicularList = response.content as FlotaVehicular[];
        this.paginador = response;
      },
      error: (error: any) => {
        // Se manejan los errores que puedan ocurrir durante la solicitud
        console.error('Error al cargar items de la lista', error);
        Swal.fire('Error', 'Ha ocurrido un error al cargar la lista. Por favor, intenta nuevamente más tarde.', 'error');
      }
    });

    this.subscriptions.push(sub);
  }

  /**
   * Método que realiza la búsqueda de flotaVehicularList según el término especificado.
   */
  searchList(): void {
    if (this.searchValue.trim() === '') {
      // Si el término de búsqueda está vacío, obtener la lista completa sin eliminados
      this.obtenerListaNoEliminadaOrdenada(this.sortColumn, this.sortDirection);
    } else {
      // Si hay un término de búsqueda, realizar la búsqueda con el término especificado
      this.page = 0; // Establecer la página inicial para la búsqueda
      const sub = this.flotaVehicularService.searchList(this.searchValue, this.page, this.pageSize).subscribe({
        next: (response: any) => {
          // Se procesa la respuesta y se actualiza el componente con los datos recibidos
          this.flotaVehicularList = response.content as FlotaVehicular[];
          this.paginador = response;
        },
        error: (error: any) => {
          // Se manejan los errores que puedan ocurrir durante la búsqueda
          console.error('Error al realizar la busqueda:', error);
          Swal.fire('Error', 'Ha ocurrido un error al cargar la lista de Busqueda. Por favor, intenta nuevamente más tarde.', 'error');
        }
      });

      this.subscriptions.push(sub);
    }
  }

  /**
   * Método que se ejecuta cuando el campo de búsqueda se borra.
   */
  clearSearchField(): void {
    if (this.searchValue.trim() === '') {
      // Si el campo de búsqueda está vacío, obtener la lista completa sin eliminados
      this.obtenerListaNoEliminadaOrdenada(this.sortColumn, this.sortDirection);
    }
  }

  /**
   * Método que elimina una flotaVehicular.
   * @param flotaVehicular La flotaVehicular a eliminar.
   */
  delete(flotaVehicular: FlotaVehicular): void {
    // Muestra una alerta para confirmar la eliminación de la flotaVehicular
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success me-2',
        cancelButton: 'btn btn-danger me-2'
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: '¿Está seguro?',
      text: `¿Está seguro que desea eliminar ${flotaVehicular.tipoVehiculo.tipo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Realiza una solicitud al servicio para marcar la flotaVehicular como eliminada
        const sub = this.flotaVehicularService.statusEliminado(flotaVehicular.codigo).subscribe({
          next: response => {
            // Si se elimina correctamente, se filtra la flotaVehicular de la lista local
            this.flotaVehicularList = this.flotaVehicularList.filter(ec => ec !== flotaVehicular);
            swalWithBootstrapButtons.fire(
              'Elemento eliminado',
              `Elemento ${flotaVehicular.codigo} marcado como eliminado con éxito.`,
              'success'
            );
          },
          error: error => {
            // Se maneja el error en caso de que ocurra algún problema al eliminar la flotaVehicular
            swalWithBootstrapButtons.fire(
              'Error',
              'Hubo un error al eliminar Elemento',
              'error'
            );
          }
        });
        this.subscriptions.push(sub);
      }
    });
  }

  /**
   * Método que abre el modal para crear o editar una flotaVehicular.
   * @param flotaVehicular La flotaVehicular a editar (opcional).
   */
  public openModal(flotaVehicular?: FlotaVehicular): void {
    // Abre el modal para crear o editar una flotaVehicular
    var dialogRef = this.dialog.open(ModalFlotaVehicularComponent, {
      enterAnimationDuration: '1000ms',
      exitAnimationDuration: '1000ms',
    });

    if (flotaVehicular != null)
      dialogRef.componentInstance.flotaVehicular = flotaVehicular;
    dialogRef.afterClosed().subscribe({
      next: result => {
        console.info('Result:', result);
        if (result) {
          // Refresca el listado de flotaVehicularList después de crear o editar una flotaVehicular
          this.obtenerListaNoEliminadaOrdenada(this.sortColumn, this.sortDirection);
        }
      },
      error: error => {
        console.error(error);
      }
    });
  }

  /**
   * Método para convertir el valor del campo de búsqueda a mayúsculas.
   */
  toUpperCase(): void {
    this.searchValue = this.searchValue.toUpperCase();
  }

  /**
   * Método que valida los caracteres ingresados en el campo de nombre.
   * @param event El evento del teclado.
   */
  onKeyPress(event: KeyboardEvent): void {
    const char = event.key;

    // Expresión regular para permitir solo mayúsculas, minúsculas, números y espacios
    const isValidCharacter = /^[a-zA-Z0-9\s]+$/.test(char);

    if (!isValidCharacter) {
      event.preventDefault();
    }
  }

  /**
  * Método que se ejecuta cuando se hace clic en el encabezado de una columna para ordenar.
  * @param column La columna por la cual se desea ordenar.
  */
  sortList(column: string): void {
    // Si la columna clicada es la misma que la columna de ordenamiento actual,
    // invertimos la dirección del ordenamiento, si no, establecemos la dirección a 'asc'.
    if (column === this.sortColumn) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    // Llamamos al método para obtener la lista ordenada.
    this.obtenerListaNoEliminadaOrdenada(this.sortColumn, this.sortDirection);
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    // Realiza la llamada para obtener la lista actualizada con el nuevo tamaño de página
    this.obtenerListaNoEliminadaOrdenada(this.sortColumn, this.sortDirection);
  }

}
