import { MatSelectionListChange, MatListOption } from '@angular/material/list';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Subscription, Observable, of, map } from 'rxjs';
import { MatDialogRef } from '@angular/material/dialog';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { ModalPersonalPolicialComponent } from '../../forms-personas/modal-personal-policial/modal-personal-policial.component';
import { Mantenimiento } from 'src/app/entities/mantenimientos/Mantenimiento';
import { Solicitud, TipoSolicitud } from 'src/app/entities/mantenimientos/Solicitud';
import { CommonUtilsModal } from 'src/app/generics_methods/CommonUtilsModal';
import { SolicitudService } from 'src/app/services/services-mantenimientos/solicitud.service';
import { TipoMantenimiento } from 'src/app/entities/mantenimientos/TipoMantenimiento';
import { TipoMantenimientoService } from 'src/app/services/services-mantenimientos/tipo-mantenimiento.service';
import { MantenimientoService } from 'src/app/services/services-mantenimientos/mantenimiento.service';
import { MantenimientoTipo } from 'src/app/entities/mantenimientos/MantenimientoTipo';
import { ResponseService } from 'src/app/entities/ResponseService';
import { MantenimientoTipoService } from 'src/app/services/services-mantenimientos/mantenimiento-tipo.service';
import Swal from 'sweetalert2';
import { EstadoOrdenTrabajo, OrdenTrabajo } from 'src/app/entities/mantenimientos/OrdenTrabajo';
import { OrdenTrabajoService } from 'src/app/services/services-mantenimientos/orden-trabajo.service';

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
  listValor!: TipoMantenimiento[];
  listDetalleMantenimiento!: MantenimientoTipo[];

  constructor(
    private formBuilder: FormBuilder,
    private solicitudService: SolicitudService,
    private tipoMantenimientoService: TipoMantenimientoService,
    private mantenimientoService: MantenimientoService,
    private mantenimientoTipoService: MantenimientoTipoService,
    private ordenTrabajoService: OrdenTrabajoService,
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

      this.listSolicitud = list.filter(entity => entity.estado === 'A');
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
  * Método que se encarga de agregar un mantenimiento.
  */
  agregar() {
    this.create();
  }

  public create(): void {

    const sub = this.mantenimientoService.insertMantenimiento(this.crearMantenimiento()).subscribe(
      {
        next: (json: ResponseService) => {
          if (json.pv_error === null) {
            this.mantenimientoTipoService.insertList(this.crearListDetalleMantenimiento(json.p_codigo)).subscribe({
              next: (jsonDetails: any) => {
                if (jsonDetails) {
                  this.ordenTrabajoService.create(this.crearOrdenTrabajo(json.p_codigo)).subscribe({
                    next: () => {
                      this.solicitudService.actualizaEstadoSolicitud(this.crearSolicitud()).subscribe();
                    }
                  });
                  Swal.fire('Nuevo Mantenimiento', `El elemento ha sido creado con exito: ${json.p_codigo}`, 'success');
                  this.dialogRef.close(true);
                }
              },
            });

          }
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

  crearSolicitud() {
    const solicitud = new Solicitud();
    solicitud.codigo = this.formulario.value?.solicitud?.codigo;
    solicitud.estado = TipoSolicitud.MANTENIMIENTO;
    return solicitud;
  }

  crearOrdenTrabajo(codigoMantenimiento: number) {

    const ordenTrabajo = new OrdenTrabajo();
    ordenTrabajo.codigo = -1;
    ordenTrabajo.eliminado = 'N';
    ordenTrabajo.estado = EstadoOrdenTrabajo.GENERADA;
    ordenTrabajo.fechaEntrega = this.sumarDiasLaborables(new Date(), 3);
    ordenTrabajo.kilometrajeMantenimiento = 0;
    ordenTrabajo.mantenimiento = new Mantenimiento().constructorPK(codigoMantenimiento);
    ordenTrabajo.observacion = 'ORDEN GENERADA EN PROCESO';
    ordenTrabajo.personalRetira = this.formulario?.value?.solicitud?.vinculacion?.vinculacionPersonal?.personalPolicial;

    return ordenTrabajo;
  }

  crearListDetalleMantenimiento(codigoMantenimiento: number) {
    this.listDetalleMantenimiento = [];
    this.listValor.forEach(item => {
      const mantenimientoTipo = new MantenimientoTipo();
      mantenimientoTipo.codigo = -1;
      mantenimientoTipo.mantenimiento = new Mantenimiento().constructorPK(codigoMantenimiento);
      mantenimientoTipo.tipo = item;
      mantenimientoTipo.eliminado = 'N'
      this.listDetalleMantenimiento.push(mantenimientoTipo);
    });

    return this.listDetalleMantenimiento;

  }

  crearMantenimiento() {
    const mantenimiento = new Mantenimiento();
    mantenimiento.solicitud = this.formulario?.value?.solicitud;
    mantenimiento.asunto = this.formulario?.value?.asunto;
    mantenimiento.detalle = this.formulario?.value?.detalle;
    mantenimiento.eliminado = 'N';
    mantenimiento.fechaIngreso = new Date();
    mantenimiento.kilometrajeActual = parseFloat(this.formulario?.value?.kilometrajeActual);
    return mantenimiento;
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


  subTotal: number = 0;
  ivaTotal: number = 0;
  total: number = 0;
  // Método que se ejecuta cuando cambia la selección
  onChangeMantenimiento(event: MatSelectionListChange) {

    const selectedOptions = event.source.selectedOptions.selected;
    const selectedMantenimientos = selectedOptions.map(option => option.value);

    this.listValor = selectedMantenimientos;
    this.subTotal = 0;
    this.ivaTotal = 0;
    this.total = 0;
    for (let valor of this.listValor) {
      this.subTotal += valor.costo;
      this.ivaTotal += (valor.costo * (1 + valor.tipoContrato.iva / 100)) - valor.costo;
      this.total = this.subTotal + this.ivaTotal;
    }

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

  sumarDiasLaborables(fecha: Date, dias: number): Date {
    let diasLaborablesSumados = 0;
    let fechaActual = new Date(fecha); // Clonar la fecha para no modificar la original

    while (diasLaborablesSumados < dias) {
      // Avanzar un día
      fechaActual.setDate(fechaActual.getDate() + 1);

      // Verificar si es día laborable (lunes a viernes)
      if (fechaActual.getDay() !== 0 && fechaActual.getDay() !== 6) {
        diasLaborablesSumados++;
      }
    }
    return fechaActual;
  }

}
