import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription, map, of } from 'rxjs';
import { Solicitud, TipoSolicitud } from 'src/app/entities/mantenimientos/Solicitud';
import { Vinculacion } from 'src/app/entities/mantenimientos/Vinculacion';
import { CommonUtilsModal } from 'src/app/generics_methods/CommonUtilsModal';
import { SolicitudService } from 'src/app/services/services-mantenimientos/solicitud.service';
import { VinculacionService } from 'src/app/services/services-mantenimientos/vinculacion.service';
import Swal from 'sweetalert2';

const DEFAULT_CODIGO = -1;

@Component({
  selector: 'app-modal-solicitud',
  templateUrl: './modal-solicitud.component.html',
  styleUrls: ['./modal-solicitud.component.css']
})
export class ModalSolicitudComponent implements OnInit {

  selected!: Date | null;

  control = new FormControl('');

  /**
  * Solicitud recibida como entrada para mostrar o actualizar los datos.
  */
  @Input() public solicitud!: Solicitud;

  /**
  * Título del modal.
  */
  public titulo: string = 'Solicitud';

  /**
  * Formulario reactivo para manejar los datos de la flotaVehicular.
  */
  public formulario!: FormGroup;

  /**
  * Formulario reactivo para manejar los datos de la flotaVehicular.
  */
  public errores!: string[];

  /**
  * Array de suscripciones para gestionar la destrucción de las mismas en el ciclo de vida del componente.
  */
  private subscriptions: Subscription[] = [];

  // Observable para filtrar y mostrar las opciones
  filteredVinculacion!: Observable<Vinculacion[]>;
  filteredVinculacioFlota!: Observable<Vinculacion[]>;

  // Función para mostrar el nombre en el campo de autocompletado
  displayVinculacion(vinculacion: Vinculacion): string {
    if (!vinculacion) {
      return '';
    }
    const identificacion = vinculacion.vinculacionPersonal?.personalPolicial.identificacion || '';
    const nombreCompleto = vinculacion.vinculacionPersonal?.personalPolicial.nombreCompleto || '';
    return `${identificacion}-${nombreCompleto}`;
  }

  displayVinculacionFlota(vinculacion: Vinculacion): string {
    if (!vinculacion) {
      return '';
    }
    const placa = vinculacion.vinculacionFlota?.flotaVehicular.placa || '';
    const tipo = vinculacion.vinculacionFlota?.flotaVehicular.tipoVehiculo.tipo || '';
    const marca = vinculacion.vinculacionFlota?.flotaVehicular.marca || '';
    return `${placa}-${tipo}-${marca}`;
  }


  public listVinculacion!: Vinculacion[];
  public listVinculacionFlota!: Vinculacion[];

  constructor(
    private formBuilder: FormBuilder,
    private vinculacionService: VinculacionService,
    private dialogRef: MatDialogRef<ModalSolicitudComponent>,
    private solicitudService: SolicitudService
  ) {
    // Inicializa flotaVehicular si es null
  }

  ngOnInit(): void {
    this.setupVinculacion();
    this.formulario = this.formBuilder.group({
      vinculacion: [''],
      vinculacionFlota: [''],
      distrito: [''],
      parroquia: [''],
      circuito: [''],
      subcircuito: [''],
      kilometrajeActual: [''],
      observacion: ['']
    });
  }

  setupVinculacion(): void {
    this.vinculacionService.getElemtsform().subscribe(list => {

      this.listVinculacion = list;
      // if (this.listVinculacion) {
      //   const uniqueList = Array.from(new Set(
      //     this.listVinculacion.map(item => item?.vinculacionPersonal.personalPolicial.identificacion)
      //       .filter(identificacion => identificacion !== undefined)
      //   ));

      //   this.listVinculacion = uniqueList.map(identificacion =>
      //     this.listVinculacion.find(item =>
      //       item?.vinculacionPersonal.personalPolicial.identificacion === identificacion
      //     ) as Vinculacion
      //   );
      // }
      this.filteredVinculacion = of(this.listVinculacion).pipe(
        map(value => this.filterVinculacion(''))
      );
    });
  }

  setupVinculacionFlota(identificacion: string): void {
    this.vinculacionService.getElemtsform().subscribe(list => {
      this.listVinculacionFlota = list.filter(entity => entity.vinculacionPersonal.personalPolicial.identificacion === identificacion);
      this.filteredVinculacioFlota = of(this.listVinculacionFlota).pipe(
        map(value => this.filterVinculacionFlota(''))
      );
    });
  }
  /**
   * Método que cierra el modal sin realizar ninguna acción adicional.
   */
  public dismiss() {
    this.control.reset(); // Restablecer el valor del control de autocompletar al cerrar el diálogo
    this.dialogRef.close('Closed');
  }
  /**
   * Método que cierra el modal y retorna el estado de la operación al componente padre.
   * @param conf Valor booleano que indica si la operación fue exitosa o no.
   */
  public close(conf: boolean) {
    this.dialogRef.close(conf); // Utilizar dialogRef para cerrar el modal
  }

  agregar(): void {

    this.create();

  }

  public create(): void {

    const vinculacion = this.formulario.value.vinculacionFlota as Vinculacion;
    const solicitud = this.createSolicitud(vinculacion);

    const sub = this.solicitudService.create(solicitud).subscribe({
      next: (json: any) => {
        Swal.fire('Nuevo Elemento', `${json.mensaje}: ${json.elemento.nombre}`, 'success');
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.errores = err.error?.errors as string[];
        const errorMessage = err.error?.mensaje || 'Ha ocurrido un error en el servidor';
        console.error('Código de error desde el backend: ' + err.status);
        console.error(err.error?.errors);
        Swal.fire('Error', errorMessage, 'error');
      }
    }
    );
    this.subscriptions.push(sub);
  }

  createSolicitud(vinculacion: Vinculacion) {
    const solicitud = new Solicitud();
    solicitud.codigo = DEFAULT_CODIGO;
    solicitud.vinculacion = vinculacion;
    solicitud.kilometraje = this.formulario.value.kilometrajeActual;
    solicitud.fechaReserva = this.selected || new Date();
    solicitud.estado = TipoSolicitud.INGRESADA;
    solicitud.observacion = this.formulario.value.observacion;
    solicitud.eliminado = 'N';

    return solicitud;
  }

  /**
* Evento que se dispara cuando el valor del campo de autocompletado cambia.
* @param event Evento de cambio del campo de autocompletado.
*/
  onInputValueChangedVinculacion(event: Event): void {
    const inputText = (event.target as HTMLInputElement)?.value;
    const normalizedInput = inputText ? inputText.trim() : '';
    if (normalizedInput) {
      this.filteredVinculacion = of(this.listVinculacion).pipe(
        map(listDependencia =>
          listDependencia.filter(obj =>
            CommonUtilsModal.normalizeValue(obj.vinculacionPersonal.personalPolicial.identificacion).includes(CommonUtilsModal.normalizeValue(normalizedInput)) ||
            CommonUtilsModal.normalizeValue(obj.vinculacionPersonal.personalPolicial.nombreCompleto).includes(CommonUtilsModal.normalizeValue(normalizedInput))
          )
        )
      );
    } else {
      this.filteredVinculacion = of(this.listVinculacion);
    }
  }

  /**
  * Función que filtra la lista la entidad por nombre, utilizando un valor de búsqueda.
  * @param value Valor de búsqueda.
  * @returns Lista filtrada de la entidad.
  */
  private filterVinculacion(value: string): Vinculacion[] {
    return CommonUtilsModal.filterEntitiesByName(this.listVinculacion, 'vinculacionPersonal', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedVinculacion(event: MatAutocompleteSelectedEvent): void {
    const selectedVinculacion = event.option.value as Vinculacion;
    this.control.setValue(selectedVinculacion.vinculacionPersonal.personalPolicial.identificacion);
    this.setupVinculacionFlota(selectedVinculacion.vinculacionPersonal.personalPolicial.identificacion);
    this.formulario.get('vinculacionFlota')?.setValue('');
    this.clearControlDependencia();
  }
  /**
* Evento que se dispara cuando el valor del campo de autocompletado cambia.
* @param event Evento de cambio del campo de autocompletado.
*/
  onInputValueChangedVinculacionFlota(event: Event): void {
    const inputText = (event.target as HTMLInputElement)?.value;
    const normalizedInput = inputText ? inputText.trim() : '';
    if (normalizedInput) {
      this.filteredVinculacioFlota = of(this.listVinculacionFlota).pipe(
        map(listVinculacionFlota =>
          listVinculacionFlota.filter(obj =>
            CommonUtilsModal.normalizeValue(obj.vinculacionFlota.flotaVehicular.placa).includes(CommonUtilsModal.normalizeValue(normalizedInput))
          )
        )
      );
    } else {
      this.filteredVinculacioFlota = of(this.listVinculacionFlota);
    }
  }

  /**
  * Función que filtra la lista la entidad por nombre, utilizando un valor de búsqueda.
  * @param value Valor de búsqueda.
  * @returns Lista filtrada de la entidad.
  */
  private filterVinculacionFlota(value: string): Vinculacion[] {
    return CommonUtilsModal.filterEntitiesByName(this.listVinculacionFlota, 'vinculacionFlota', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedVinculacionFlota(event: MatAutocompleteSelectedEvent): void {
    const selectedVinculacionFlota = event.option.value as Vinculacion;
    this.control.setValue(selectedVinculacionFlota.vinculacionFlota.flotaVehicular.placa);
    if (selectedVinculacionFlota) {
      this.formulario.get('distrito')?.setValue(selectedVinculacionFlota.vinculacionFlota.dependencia.dependenciaPadre.dependenciaPadre.dependenciaPadre.nombre);
      this.formulario.get('parroquia')?.setValue(selectedVinculacionFlota.vinculacionFlota.dependencia.dependenciaPadre.dependenciaPadre.nombre);
      this.formulario.get('circuito')?.setValue(selectedVinculacionFlota.vinculacionFlota.dependencia.dependenciaPadre.nombre);
      this.formulario.get('subcircuito')?.setValue(selectedVinculacionFlota.vinculacionFlota.dependencia.nombre);
    }
  }

  clearControlDependencia() {
    this.formulario.get('distrito')?.setValue('');
    this.formulario.get('parroquia')?.setValue('');
    this.formulario.get('circuito')?.setValue('');
    this.formulario.get('subcircuito')?.setValue('');
  }

}
