import { MatSelectionListChange, MatListOption } from '@angular/material/list';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Subscription, Observable, of, map } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ModalPersonalPolicialComponent } from '../../forms-personas/modal-personal-policial/modal-personal-policial.component';
import { Mantenimiento } from 'src/app/entities/mantenimientos/Mantenimiento';
import { Solicitud } from 'src/app/entities/mantenimientos/Solicitud';
import { CommonUtilsModal } from 'src/app/generics_methods/CommonUtilsModal';
import { SolicitudService } from 'src/app/services/services-mantenimientos/solicitud.service';
import { TipoMantenimiento } from 'src/app/entities/mantenimientos/TipoMantenimiento';
import { TipoMantenimientoService } from 'src/app/services/services-mantenimientos/tipo-mantenimiento.service';

@Component({
  selector: 'app-modal-mantenimiento',
  templateUrl: './modal-mantenimiento.component.html',
  styleUrls: ['./modal-mantenimiento.component.css']
})
export class ModalMantenimientoComponent implements OnInit {

  control = new FormControl('');

  /**
  * PersonalPolicial recibida como entrada para mostrar o actualizar los datos.
  */
  @Input() public mantenimiento!: Mantenimiento;

  /**
  * Título del modal.
  */
  public titulo: string = 'Mantenimiento';

  /**
  * Formulario reactivo para manejar los datos de la personalPolicial.
  */
  public formulario!: FormGroup;

  /**
  * Formulario reactivo para manejar los datos de la personalPolicial.
  */
  public errores!: string[];

  /**
  * Array de suscripciones para gestionar la destrucción de las mismas en el ciclo de vida del componente.
  */
  private subscriptions: Subscription[] = [];

  // Observable para filtrar y mostrar las opciones
  filteredSolicitud!: Observable<Solicitud[]>;

  // Función para mostrar el nombre en el campo de autocompletado
  displaySolicitud(solicitud: Solicitud): string {
    if (!solicitud) {
      return '';
    }
    const numeroSolicitud = solicitud.codigo || '';
    return `${numeroSolicitud}`;
  }

  listSolicitud!: Solicitud[];
  listTipoMantenimiento!: TipoMantenimiento[];

  constructor(
    private formBuilder: FormBuilder,
    private solicitudService: SolicitudService,
    private tipoMantenimientoService: TipoMantenimientoService,
    private dialogRef: MatDialogRef<ModalPersonalPolicialComponent>,
  ) {
    // Inicializa personalPolicial si es null
  }



  ngOnInit(): void {
    this.setupVinculacion();
    this.setupTipoMantenimiento();
    this.formulario = this.formBuilder.group({
      solicitud: [''],
      kilometrajeActual: [''],
      tipoVehiculo: [''],
      placa: [''],
      marca: [''],
      modelo: [''],
      identificacion: [''],
      nombreCompleto: [''],
      asunto: [''],
      detalle: ['']

    });


  }
  setupTipoMantenimiento(): void {
    this.tipoMantenimientoService.getElemtsform().subscribe(list => {
      this.listTipoMantenimiento = list;
    });
  }

  setupVinculacion(): void {
    this.solicitudService.getElemtsform().subscribe(list => {

      this.listSolicitud = list;
      this.filteredSolicitud = of(this.listSolicitud).pipe(
        map(value => this.filterSolicitud(''))
      );
    });
  }

  /**
 * Método que se ejecuta al destruir el componente.
 */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
  * Método que se encarga de agregar o actualizar la personalPolicial, dependiendo de si el código es -1 o no.
  */
  agregar() {
  }

  /**
   * Método que cierra el modal y retorna el estado de la operación al componente padre.
   * @param conf Valor booleano que indica si la operación fue exitosa o no.
   */
  public close(conf: boolean) {
    this.dialogRef.close(conf); // Utilizar dialogRef para cerrar el modal
  }

  /**
   * Método que cierra el modal sin realizar ninguna acción adicional.
   */
  public dismiss() {
    this.control.reset(); // Restablecer el valor del control de autocompletar al cerrar el diálogo
    this.dialogRef.close('Closed');
  }
  /**
* Evento que se dispara cuando el valor del campo de autocompletado cambia.
* @param event Evento de cambio del campo de autocompletado.
*/
  onInputValueChangedSolicitud(event: Event): void {
    const inputText = (event.target as HTMLInputElement)?.value;
    const normalizedInput = inputText ? inputText.trim() : '';
    if (normalizedInput) {
      this.filteredSolicitud = of(this.listSolicitud).pipe(
        map(listSolicitud =>
          listSolicitud.filter(obj =>
            CommonUtilsModal.normalizeValue(obj.codigo.toString()).includes(CommonUtilsModal.normalizeValue(normalizedInput))
          )
        )
      );
    } else {
      this.filteredSolicitud = of(this.listSolicitud);
    }
  }

  /**
  * Función que filtra la lista la entidad por nombre, utilizando un valor de búsqueda.
  * @param value Valor de búsqueda.
  * @returns Lista filtrada de la entidad.
  */
  private filterSolicitud(value: string): Solicitud[] {
    return CommonUtilsModal.filterEntitiesByName(this.listSolicitud, 'codigo', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedSolicitud(event: MatAutocompleteSelectedEvent): void {
    const selectedSolicitud = event.option.value as Solicitud;
    this.control.setValue(selectedSolicitud.codigo.toString());
    if (selectedSolicitud) {
      this.formulario.get('tipoVehiculo')?.setValue(selectedSolicitud.vinculacion.vinculacionFlota.flotaVehicular.tipoVehiculo.tipo);
      this.formulario.get('placa')?.setValue(selectedSolicitud.vinculacion.vinculacionFlota.flotaVehicular.placa);
      this.formulario.get('marca')?.setValue(selectedSolicitud.vinculacion.vinculacionFlota.flotaVehicular.marca);
      this.formulario.get('modelo')?.setValue(selectedSolicitud.vinculacion.vinculacionFlota.flotaVehicular.modelo);
      this.formulario.get('identificacion')?.setValue(selectedSolicitud.vinculacion.vinculacionPersonal.personalPolicial.identificacion);
      this.formulario.get('nombreCompleto')?.setValue(selectedSolicitud.vinculacion.vinculacionPersonal.personalPolicial.nombreCompleto);
    }
  }

  listValor!: TipoMantenimiento[];

  // Método que se ejecuta cuando cambia la selección
  onChangeMantenimiento(event: MatSelectionListChange) {

    const selectedOptions = event.source.selectedOptions.selected;
    const selectedMantenimientos = selectedOptions.map(option => option.value);

    this.listValor = selectedMantenimientos;

    if (selectedMantenimientos) {
      selectedMantenimientos.forEach(selectedMantenimiento => {
        if (selectedMantenimiento.nombre === 'MANTENIMIENTO 1') {
          event.source.options.toArray().forEach(option => {
            option.disabled = option.value.nombre === "MANTENIMIENTO 2";
          });
        } else if (selectedMantenimiento.nombre === 'MANTENIMIENTO 2') {
          event.source.options.toArray().forEach(option => {
            option.disabled = option.value.nombre === "MANTENIMIENTO 1";
          });
        }
      });
    }
    if (selectedOptions.length == 0) {
      event.source.options.toArray().forEach(option => {
        option.disabled = false;
      });
    }
  }
}
