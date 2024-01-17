import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Sugerencia } from 'src/app/entities/personas/Sugerencia';
import { APP_DATE_FORMATS, AppDateAdapter } from 'src/app/generics_methods/AppDateAdapter';
import { SugerenciaService } from 'src/app/services/services-personas/sugerencia.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reporte-sugerencia',
  templateUrl: './reporte-sugerencia.component.html',
  styleUrls: ['./reporte-sugerencia.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
  ]
})
export class ReporteSugerenciaComponent {

  /**
  * Formulario reactivo para manejar los datos de la flotaVehicular.
  */
  public form!: FormGroup;

  page!: number;
  pageSize: number = 10;
  sugerenciaList!: Sugerencia[];
  paginador: any;
  nombre: string = 'sugerencia';
  etiquetabtn: string = '+ Crear Nuevo';
  searchValue: string = '';
  private subscriptions: Subscription[] = [];
  sortColumn: string = ''; // Campo de ordenamiento actual
  sortDirection: string = 'asc'; // Orden actual ('asc' o 'desc')

  url?: string;

  constructor(
    private formBuilder: FormBuilder,
    private sugerenciaService: SugerenciaService,
    private activatedRoute: ActivatedRoute
  ) {
    this.url = this.activatedRoute.snapshot.parent?.url.join('/');
  }

  /**
   * Método que se ejecuta al inicializar el componente.
   */
  ngOnInit(): void {
    this.form = this.formBuilder.group({
      fechaInicio: [new Date()],
      fechaFin: [new Date()]

    });


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

      // Obtiene la lista de sugerenciaList sin eliminar para la página actual
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
    const sub: Subscription = this.sugerenciaService.getNotDeletedOrdered(this.pageSize, this.page, sortColumn, sortDirection).subscribe({
      next: (response: any) => {
        // Se procesa la respuesta y se actualiza el componente con los datos recibidos
        this.sugerenciaList = response.content as Sugerencia[];
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
   * Método que realiza la búsqueda de sugerenciaList según el término especificado.
   */
  searchList(): void {
    if (this.searchValue.trim() === '') {
      // Si el término de búsqueda está vacío, obtener la lista completa sin eliminados
      this.obtenerListaNoEliminadaOrdenada(this.sortColumn, this.sortDirection);
    } else {
      // Si hay un término de búsqueda, realizar la búsqueda con el término especificado
      this.page = 0; // Establecer la página inicial para la búsqueda
      const sub = this.sugerenciaService.searchList(this.searchValue, this.page, this.pageSize).subscribe({
        next: (response: any) => {
          // Se procesa la respuesta y se actualiza el componente con los datos recibidos
          this.sugerenciaList = response.content as Sugerencia[];
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
   * Método que elimina una sugerencia.
   * @param sugerencia La sugerencia a eliminar.
   */
  delete(sugerencia: Sugerencia): void {
    // Muestra una alerta para confirmar la eliminación de la sugerencia
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success me-2',
        cancelButton: 'btn btn-danger me-2'
      },
      buttonsStyling: false
    });

    swalWithBootstrapButtons.fire({
      title: '¿Está seguro?',
      text: `¿Está seguro que desea eliminar ${sugerencia.codigo}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'No, cancelar',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        // Realiza una solicitud al servicio para marcar la sugerencia como eliminada
        const sub = this.sugerenciaService.statusEliminado(sugerencia.codigo).subscribe({
          next: response => {
            // Si se elimina correctamente, se filtra la sugerencia de la lista local
            this.sugerenciaList = this.sugerenciaList.filter(ec => ec !== sugerencia);
            swalWithBootstrapButtons.fire(
              'Elemento eliminado',
              `Elemento ${sugerencia.codigo} marcado como eliminado con éxito.`,
              'success'
            );
          },
          error: error => {
            // Se maneja el error en caso de que ocurra algún problema al eliminar la sugerencia
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

  filteredSugerenciaList: any[] = [];

  buscarPorFecha() {
    console.log(this.sugerenciaList);

    const fechaInicio = this.form.value.fechaInicio;
    const fechaFin = this.form.value.fechaFin;
    const datoInicio = new Date(fechaInicio);
    const datoFin = new Date(fechaFin);
    console.log(datoInicio.toLocaleDateString() + ' ' + "12:00:00 am");
    console.log(datoFin.toLocaleDateString() + ' ' + "11:59:59 pm");
  }
}
