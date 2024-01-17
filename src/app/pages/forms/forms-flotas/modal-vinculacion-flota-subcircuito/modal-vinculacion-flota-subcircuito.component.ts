import { Component, Input, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef } from '@angular/material/dialog';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { Observable, Subscription, map, of } from 'rxjs';
import { Dependencia } from 'src/app/entities/dependencias/dependencia';
import { FlotaVehicular } from 'src/app/entities/flotas/FlotaVehicular';
import { VinculacionFlotaSubcircuito } from 'src/app/entities/flotas/VinculacionFlotaSubcircuito';
import { CommonUtilsModal } from 'src/app/generics_methods/CommonUtilsModal';
import { DependenciaService } from 'src/app/services/services-dependencias/dependencia.service';
import { FlotaVehicularService } from 'src/app/services/services-flotas/flota-vehicular.service';
import { VinculacionFlotaSubcircuitoService } from 'src/app/services/services-flotas/vinculacion-flota-subcircuito.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-vinculacion-flota-subcircuito',
  templateUrl: './modal-vinculacion-flota-subcircuito.component.html',
  styleUrls: ['./modal-vinculacion-flota-subcircuito.component.css']
})
export class ModalVinculacionFlotaSubcircuitoComponent {

  disabledMatSelection: boolean = false;
  isVisibleCheck: boolean = true;

  @ViewChild(MatSelectionList) matList!: MatSelectionList;

  control = new FormControl('');

  /**
  * VinculacionFlotaSubcircuito recibida como entrada para mostrar o actualizar los datos.
  */
  @Input() public vinculacionFlotaSubcircuito!: VinculacionFlotaSubcircuito;

  /**
  * Título del modal.
  */
  public titulo: string = 'Vinculacion Flota Subcircuito';

  /**
  * Formulario reactivo para manejar los datos de la dependencia.
  */
  public formulario!: FormGroup;

  /**
  * Formulario reactivo para manejar los datos de la dependencia.
  */
  public errores!: string[];

  /**
  * Array de suscripciones para gestionar la destrucción de las mismas en el ciclo de vida del componente.
  */
  private subscriptions: Subscription[] = [];

  // Observable para filtrar y mostrar las opciones
  filteredDependencia!: Observable<Dependencia[]>;

  // Función para mostrar el nombre en el campo de autocompletado
  displayDependencia(dependencias: Dependencia): string {
    return dependencias?.nombre || '';
  }
  public listDependencia!: Dependencia[];
  public listFlota!: FlotaVehicular[];
  selectedAll: boolean = false;
  selectedItems: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ModalVinculacionFlotaSubcircuitoComponent>,
    private flotaVehicularService: FlotaVehicularService,
    private dependenciaService: DependenciaService,
    private vinculacionService: VinculacionFlotaSubcircuitoService
  ) {
    // Inicializa dependencia si es null
  }
  /**
  * Método que se ejecuta al inicializar el componente.
  */
  ngOnInit(): void {

    let listaFinalFiltrada: FlotaVehicular[] = [];

    this.setupDependencia();

    this.formulario = this.formBuilder.group({
      codigo: [-1],
      dependencia: ['']
    });
    if (!this.vinculacionFlotaSubcircuito) {
      this.flotaVehicularService.getElemtsform().subscribe(list => {
        this.vinculacionService.getElemtsform().subscribe(listVinculacion => {
          // Filtra la lista final para excluir elementos que están en listVinculacion
          listaFinalFiltrada = list.filter(item =>
            !listVinculacion?.some(vinculacionItem => vinculacionItem.flotaVehicular.codigo === item.codigo)
          );
          this.listFlota = listaFinalFiltrada;
        });
      });
    } else {
      this.flotaVehicularService.getElemtsform().subscribe(list => {
        this.listFlota = list.filter(item => item.codigo == this.vinculacionFlotaSubcircuito.flotaVehicular.codigo);
        this.formulario = this.formBuilder.group({
          codigo: [this.vinculacionFlotaSubcircuito?.codigo],
          dependencia: [this.vinculacionFlotaSubcircuito?.dependencia]
        });
        this.isVisibleCheck = false;
        this.disabledMatSelection = true;
      });
    }
  }


  /**
  * Método que se encarga de agregar o actualizar la dependencia, dependiendo de si el código es -1 o no.
  */
  agregar() {
    if (this.formulario.value.codigo == -1) {
      this.create();
    } else {
      this.update();
    }
  }

  createVinculacion(flotaVehicular: FlotaVehicular, dependencia: Dependencia) {

    const vinculacion = new VinculacionFlotaSubcircuito();
    vinculacion.codigo = -1;
    vinculacion.flotaVehicular = flotaVehicular;
    vinculacion.dependencia = dependencia;
    vinculacion.eliminado = 'N';

    return vinculacion;
  }

  /**
   * Método que realiza la creación de una nueva empresa.
   */
  public create(): void {
    const dependencia = this.formulario.value.dependencia as Dependencia;
    let personalSelected: MatListOption[] = this.matList.selectedOptions.selected;
    personalSelected.forEach(item => {
      if (item.value) {
        const vinculacion = this.createVinculacion(item.value, dependencia);
        console.log('vinculacion', vinculacion);
        const sub = this.vinculacionService.create(vinculacion).subscribe({
          error: (err) => {
            this.errores = err.error?.errors as string[];
            const errorMessage = err.error?.mensaje || 'Ha ocurrido un error en el servidor';
            console.error('Código de error desde el backend: ' + err.status);
            console.error(err.error?.errors);
            Swal.fire('Error', errorMessage, 'error');
          }
        });
        this.subscriptions.push(sub);
      }
    });
    Swal.fire('Nuevo Vinculacion', `${"Generado Correctamente"}`, 'success');
    this.dialogRef.close(true);

  }

  /**
  * Método que realiza la actualización de la empresa.
  */
  public update(): void {

    const vinculacionUpdate = this.vinculacionFlotaSubcircuito;
    vinculacionUpdate.dependencia = this.formulario.value.dependencia;

    const sub = this.vinculacionService.update(vinculacionUpdate)
      .subscribe({
        next: elemento => {
          Swal.fire('Elemento Actualizado', `Elemento ${elemento.flotaVehicular.placa} actualizado con exito!`, 'success');
          this.dialogRef.close(true);
        },
        error: err => {
          this.errores = err.error.errors as string[];
          console.error('Codigo de error desde el backend:' + err.status);
          console.error(err.error.errors);
        }
      });

    this.subscriptions.push(sub);

  }
  // Método para alternar la selección de todos
  toggleSelectAll(matList: any) {
    this.selectedAll = !this.selectedAll;
    // Iterar sobre las opciones y establecer su estado de selección
    matList.options.forEach((option: any) => {
      option.selected = this.selectedAll;
    });
  }

  setupDependencia(): void {
    this.dependenciaService.getElemtsform().subscribe(list => {

      this.listDependencia = list.filter(entity => entity.jerarquia.codigo === 6);
      this.filteredDependencia = of(this.listDependencia).pipe(
        map(value => this.filterDependencia(''))
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
  onInputValueChangedDependencia(event: Event): void {
    const inputText = (event.target as HTMLInputElement)?.value;
    const normalizedInput = inputText ? inputText.trim() : '';
    if (normalizedInput) {
      this.filteredDependencia = of(this.listDependencia).pipe(
        map(listDependencia =>
          listDependencia.filter(obj =>
            CommonUtilsModal.normalizeValue(obj.nombre).includes(CommonUtilsModal.normalizeValue(normalizedInput))
          )
        )
      );
    } else {
      this.filteredDependencia = of(this.listDependencia);
    }
  }

  /**
  * Función que filtra la lista la entidad por nombre, utilizando un valor de búsqueda.
  * @param value Valor de búsqueda.
  * @returns Lista filtrada de la entidad.
  */
  private filterDependencia(value: string): Dependencia[] {
    return CommonUtilsModal.filterEntitiesByName(this.listDependencia, 'nombre', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedDepedencia(event: MatAutocompleteSelectedEvent): void {
    const selectedDepedencia = event.option.value as Dependencia;
    this.control.setValue(selectedDepedencia.nombre);

  }
}
