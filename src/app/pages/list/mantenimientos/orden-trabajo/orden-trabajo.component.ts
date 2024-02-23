import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { EstadoOrdenTrabajo, OrdenTrabajo } from 'src/app/entities/mantenimientos/OrdenTrabajo';
import { Solicitud, TipoSolicitud } from 'src/app/entities/mantenimientos/Solicitud';
import { ModalOrdenTrabajoComponent } from 'src/app/pages/forms/forms-mantenimientos/modal-orden-trabajo/modal-orden-trabajo.component';
import { OrdenTrabajoService } from 'src/app/services/services-mantenimientos/orden-trabajo.service';
import { SolicitudService } from 'src/app/services/services-mantenimientos/solicitud.service';
import Swal from 'sweetalert2';

const KM_MOTOS = 2000;
const KM_OTROS = 5000;

@Component({
  selector: 'app-orden-trabajo',
  templateUrl: './orden-trabajo.component.html',
  styleUrls: ['./orden-trabajo.component.css']
})
export class OrdenTrabajoComponent {

  page!: number;
  pageSize: number = 10;
  ordenTrabajoList!: OrdenTrabajo[];
  paginador: any;
  nombre: string = 'ordenTrabajo';
  etiquetabtn: string = '+ Crear Nuevo';
  searchValue: string = '';
  private subscriptions: Subscription[] = [];
  sortColumn: string = ''; // Campo de ordenamiento actual
  sortDirection: string = 'asc'; // Orden actual ('asc' o 'desc')

  url?: string;

  constructor(
    private dialog: MatDialog,
    private ordenTrabajoService: OrdenTrabajoService,
    private solicitudService: SolicitudService,
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

      // Obtiene la lista de ordenTrabajoList sin eliminar para la página actual
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
    // Realiza una ordenTrabajo al servicio para obtener la lista de tiposTelefono no eliminados con ordenamiento
    const sub: Subscription = this.ordenTrabajoService.getNotDeletedOrdered(this.pageSize, this.page, sortColumn, sortDirection).subscribe({
      next: (response: any) => {
        // Se procesa la respuesta y se actualiza el componente con los datos recibidos
        this.ordenTrabajoList = response.content as OrdenTrabajo[];
        this.paginador = response;
      },
      error: (error: any) => {
        // Se manejan los errores que puedan ocurrir durante la ordenTrabajo
        console.error('Error al cargar items de la lista', error);
        Swal.fire('Error', 'Ha ocurrido un error al cargar la lista. Por favor, intenta nuevamente más tarde.', 'error');
      }
    });

    this.subscriptions.push(sub);
  }

  /**
   * Método que realiza la búsqueda de ordenTrabajoList según el término especificado.
   */
  searchList(): void {
    if (this.searchValue.trim() === '') {
      // Si el término de búsqueda está vacío, obtener la lista completa sin eliminados
      this.obtenerListaNoEliminadaOrdenada(this.sortColumn, this.sortDirection);
    } else {
      // Si hay un término de búsqueda, realizar la búsqueda con el término especificado
      this.page = 0; // Establecer la página inicial para la búsqueda
      const sub = this.ordenTrabajoService.searchList(this.searchValue, this.page, this.pageSize).subscribe({
        next: (response: any) => {
          // Se procesa la respuesta y se actualiza el componente con los datos recibidos
          this.ordenTrabajoList = response.content as OrdenTrabajo[];
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
  * Método que procesar una orden de trabajo.
  * @param ordenTrabajo La orden de trabajo a procesar.
  */
  procesar(ordenTrabajo: OrdenTrabajo, estado: string): void {
    // Muestra una alerta para confirmar la eliminación de la solicitud
    if (ordenTrabajo.estado === estado) {
      Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 4000,
        width: '30%',
        background: 'white',
        padding: '5%',
        color: '#FF0000'

      }).fire({
        icon: 'error',
        title: `La Orden de trabajo número ${ordenTrabajo.codigo} se encuentra ${this.convertEstadoOrdenTrabajo(ordenTrabajo.estado)}.`,
        iconColor: '#FF0000'
      });
      return;
    }

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success me-2',
        cancelButton: 'btn btn-danger me-2'
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: '¿Está seguro?',
      text: `¿Está seguro que desea ${this.estadoOrdenTrabajo(estado)} la orden de trabajo Nro. ${ordenTrabajo.codigo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Sí, ${this.estadoOrdenTrabajo(estado)}`,
      cancelButtonText: 'No, cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Realiza una solicitud al servicio para marcar la solicitud como eliminada
        ordenTrabajo.estado = estado === 'F' ? EstadoOrdenTrabajo.FINALIZADA : EstadoOrdenTrabajo.GENERADA;
        const sub = this.ordenTrabajoService.actualizaEstadoOrdenTrabajo(ordenTrabajo).subscribe({
          next: response => {

            this.calculoProximoMantenimiento(ordenTrabajo);
            ordenTrabajo.kilometrajeMantenimiento = this.kmProximoMantenimiento;
            this.ordenTrabajoService.update(ordenTrabajo).subscribe();

            ordenTrabajo.mantenimiento.solicitud.estado = estado === 'F' ? TipoSolicitud.FINALIZADA : TipoSolicitud.MANTENIMIENTO;
            this.solicitudService.actualizaEstadoSolicitud(ordenTrabajo.mantenimiento.solicitud).subscribe();
            // Si se elimina correctamente, se filtra la solicitud de la lista local
            // this.solicitudList = this.solicitudList.filter(ec => ec !== solicitud);
            const estadoAlert = estado === EstadoOrdenTrabajo.FINALIZADA ? 'finalizado' : ''
            swalWithBootstrapButtons.fire(
              `Elemento ${estadoAlert}`,
              `Elemento ${ordenTrabajo.codigo} marcado como ${estadoAlert} con éxito.`,
              'success'
            );
          },
          error: error => {
            // Se maneja el error en caso de que ocurra algún problema al eliminar la solicitud
            swalWithBootstrapButtons.fire(
              'Error',
              'Hubo un error al procesar el Elemento',
              'error'
            );
          }
        });
        this.subscriptions.push(sub);
      }
    });
  }

  /**
   * Método que elimina una ordenTrabajo.
   * @param ordenTrabajo La ordenTrabajo a eliminar.
   */
  delete(ordenTrabajo: OrdenTrabajo): void {
    // Muestra una alerta para confirmar la eliminación de la ordenTrabajo
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success me-2',
        cancelButton: 'btn btn-danger me-2'
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: '¿Está seguro?',
      text: `¿Está seguro que desea eliminar ${ordenTrabajo.codigo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Realiza una ordenTrabajo al servicio para marcar la ordenTrabajo como eliminada
        const sub = this.ordenTrabajoService.statusEliminado(ordenTrabajo.codigo).subscribe({
          next: response => {
            // Si se elimina correctamente, se filtra la ordenTrabajo de la lista local
            this.ordenTrabajoList = this.ordenTrabajoList.filter(ec => ec !== ordenTrabajo);
            swalWithBootstrapButtons.fire(
              'Elemento eliminado',
              `Elemento ${ordenTrabajo.codigo} marcado como eliminado con éxito.`,
              'success'
            );
          },
          error: error => {
            // Se maneja el error en caso de que ocurra algún problema al eliminar la ordenTrabajo
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
   * Método que abre el modal para crear o editar una ordenTrabajo.
   * @param ordenTrabajo La ordenTrabajo a editar (opcional).
   */
  public openModal(ordenTrabajo?: OrdenTrabajo): void {
    // Abre el modal para crear o editar una ordenTrabajo
    var dialogRef = this.dialog.open(ModalOrdenTrabajoComponent, {
      enterAnimationDuration: '1000ms',
      exitAnimationDuration: '1000ms',
    });

    if (ordenTrabajo != null)
      //dialogRef.componentInstance.ordenTrabajo = ordenTrabajo;
      dialogRef.afterClosed().subscribe({
        next: result => {
          console.info('Result:', result);
          if (result) {
            // Refresca el listado de ordenTrabajoList después de crear o editar una ordenTrabajo
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

  convertEstadoOrdenTrabajo(estadoOT: string): string {
    switch (estadoOT) {
      case 'G':
        return 'GENERADA';
      case 'F':
        return 'FINALIZADA';
      default:
        return 'GENERADA';
    }
  }
  estadoOrdenTrabajo(estadoOT: string): string {
    switch (estadoOT) {
      case 'F':
        return 'FINALIZAR';
      default:
        return 'FINALIZAR';
    }
  }
  kmProximoMantenimiento: number = 0;

  calculoProximoMantenimiento(ordenTrabajo: OrdenTrabajo) {
    if (ordenTrabajo.mantenimiento.solicitud.vinculacion.vinculacionFlota.flotaVehicular.tipoVehiculo.codigo != 2) {
      this.kmProximoMantenimiento = ordenTrabajo.mantenimiento.kilometrajeActual + KM_OTROS;
    } else {
      this.kmProximoMantenimiento = ordenTrabajo.mantenimiento.kilometrajeActual + KM_MOTOS;
    }
  }

}
