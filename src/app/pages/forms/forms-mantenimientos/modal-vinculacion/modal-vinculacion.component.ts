import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSelectionListChange } from '@angular/material/list';
import { Observable, Subscription, map, of } from 'rxjs';
import { VinculacionPersonalSubcircuito } from 'src/app/entities/dependencias/VinculacionPersonalSubcircuito';
import { Dependencia } from 'src/app/entities/dependencias/dependencia';
import { VinculacionFlotaSubcircuito } from 'src/app/entities/flotas/VinculacionFlotaSubcircuito';
import { Vinculacion } from 'src/app/entities/mantenimientos/Vinculacion';
import { CommonUtilsModal } from 'src/app/generics_methods/CommonUtilsModal';
import { DependenciaService } from 'src/app/services/services-dependencias/dependencia.service';
import { VinculacionPersonalSubcircuitoService } from 'src/app/services/services-dependencias/vinculacion-personal-subcircuito.service';
import { VinculacionFlotaSubcircuitoService } from 'src/app/services/services-flotas/vinculacion-flota-subcircuito.service';
import { VinculacionService } from 'src/app/services/services-mantenimientos/vinculacion.service';
import Swal from 'sweetalert2';

const MAX_SELECTION = 4;
const DEFAULT_CODIGO = -1;

@Component({
  selector: 'app-modal-vinculacion',
  templateUrl: './modal-vinculacion.component.html',
  styleUrls: ['./modal-vinculacion.component.css']
})
export class ModalVinculacionComponent implements OnInit {

  control = new FormControl('');

  /**
  * Vinculacion recibida como entrada para mostrar o actualizar los datos.
  */
  @Input() public vinculacion!: Vinculacion;

  /**
  * Título del modal.
  */
  public titulo: string = 'Vinculacion';

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
  filteredParroquia!: Observable<Dependencia[]>;
  filteredCircuito!: Observable<Dependencia[]>;
  filteredSubCircuito!: Observable<Dependencia[]>;

  // Función para mostrar el nombre en el campo de autocompletado
  displayDependencia(dependencias: Dependencia): string {
    return dependencias?.nombre || '';
  }
  displayParroquia(dependencias: Dependencia): string {
    return dependencias?.nombre || '';
  }
  displayCircuito(dependencias: Dependencia): string {
    return dependencias?.nombre || '';
  }
  displaySubCircuito(dependencias: Dependencia): string {
    return dependencias?.nombre || '';
  }

  public listDependencia!: Dependencia[];
  public listParroquia!: Dependencia[];
  public listCircuito!: Dependencia[];
  public listSubCircuito!: Dependencia[];
  listPAsociado!: VinculacionPersonalSubcircuito[];
  listFAsociado!: VinculacionFlotaSubcircuito[];

  isVisible: boolean = true;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ModalVinculacionComponent>,
    private dependenciaService: DependenciaService,
    private vinPersonalSubCircuitoService: VinculacionPersonalSubcircuitoService,
    private vinFlotaSubCircuitoService: VinculacionFlotaSubcircuitoService,
    private vinculacionService: VinculacionService,
  ) {
    // Inicializa dependencia si es null
  }
  /**
  * Método que se ejecuta al inicializar el componente.
  */
  ngOnInit(): void {

    this.setupDependencia(3);
    this.listFAsociado = [this.vinculacion?.vinculacionFlota] ;
    this.listPAsociado = [this.vinculacion?.vinculacionPersonal]
    this.formulario = this.formBuilder.group({
      dependencia: ['' || this.vinculacion?.vinculacionFlota?.dependencia?.dependenciaPadre?.dependenciaPadre?.dependenciaPadre],
      dependencia1: ['' || this.vinculacion?.vinculacionFlota?.dependencia?.dependenciaPadre?.dependenciaPadre],
      dependencia2: ['' || this.vinculacion?.vinculacionFlota?.dependencia?.dependenciaPadre],
      dependencia3: ['' || this.vinculacion?.vinculacionFlota?.dependencia],
      listFlota: [this.listFAsociado],
      listPersonal: [this.listPAsociado || '']
    });
  }

  setupDependencia(jerarquia: number): void {
    this.dependenciaService.getElemtsform().subscribe(list => {

      this.listDependencia = list.filter(entity => entity.jerarquia.codigo === jerarquia);
      this.filteredDependencia = of(this.listDependencia).pipe(
        map(value => this.filterDependencia(''))
      );
    });
  }

  setupParroquia(jerarquia: number, dependenciaPadre: number): void {
    this.dependenciaService.getElemtsform().subscribe(list => {

      this.listParroquia = list.filter(entity => entity.jerarquia.codigo === jerarquia &&
        entity.dependenciaPadre.codigo === dependenciaPadre);
      this.filteredParroquia = of(this.listParroquia).pipe(
        map(value => this.filterParroquia(''))
      );
    });
  }

  setupCircuito(jerarquia: number, dependenciaPadre: number): void {
    this.dependenciaService.getElemtsform().subscribe(list => {

      this.listCircuito = list.filter(entity => entity.jerarquia.codigo === jerarquia &&
        entity.dependenciaPadre.codigo === dependenciaPadre);
      this.filteredCircuito = of(this.listCircuito).pipe(
        map(value => this.filterCircuito(''))
      );
    });
  }

  setupSubCircuito(jerarquia: number, dependenciaPadre: number): void {
    this.dependenciaService.getElemtsform().subscribe(list => {

      this.listSubCircuito = list.filter(entity => entity.jerarquia.codigo === jerarquia &&
        entity.dependenciaPadre.codigo === dependenciaPadre);
      this.filteredSubCircuito = of(this.listSubCircuito).pipe(
        map(value => this.filterSubCircuito(''))
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

  agregar(): void {
    this.create();

  }

  public create(): void {

    const vinFlotaForm = this.formulario.value?.listFlota[0] as VinculacionFlotaSubcircuito;
    const vinPersonalForm = this.formulario.value?.listPersonal as VinculacionPersonalSubcircuito[];
    if (vinFlotaForm && vinPersonalForm) {
      vinPersonalForm.forEach((item: VinculacionPersonalSubcircuito) => {
        const vinculacion = this.createVinculacion(vinFlotaForm, item);
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
      });
      Swal.fire('Nueva Vinculacion', `${"Generada Correctamente"}`, 'success');
      this.dialogRef.close(true);
    } else {
      Swal.fire('Error', 'Seleccionar una opcion', 'error');
    }

  }
  createVinculacion(vinFlota: VinculacionFlotaSubcircuito, vinPersonal: VinculacionPersonalSubcircuito) {
    const vinculacion = new Vinculacion();
    vinculacion.codigo = DEFAULT_CODIGO;
    vinculacion.vinculacionFlota = vinFlota;
    vinculacion.vinculacionPersonal = vinPersonal;
    vinculacion.eliminado = 'N';

    return vinculacion;
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
    this.setupParroquia((selectedDepedencia.jerarquia.codigo + 1), selectedDepedencia.codigo);
    this.formulario.get('dependencia1')?.setValue('');
    this.formulario.get('dependencia2')?.setValue('');
    this.formulario.get('dependencia3')?.setValue('');
    this.listPAsociado = [];
    this.listFAsociado = [];
  }
  /**
* Evento que se dispara cuando el valor del campo de autocompletado cambia.
* @param event Evento de cambio del campo de autocompletado.
*/
  onInputValueChangedParroquia(event: Event): void {
    const inputText = (event.target as HTMLInputElement)?.value;
    const normalizedInput = inputText ? inputText.trim() : '';
    if (normalizedInput) {
      this.filteredParroquia = of(this.listParroquia).pipe(
        map(listParroquia =>
          listParroquia.filter(obj =>
            CommonUtilsModal.normalizeValue(obj.nombre).includes(CommonUtilsModal.normalizeValue(normalizedInput))
          )
        )
      );
    } else {
      this.filteredParroquia = of(this.listParroquia);
    }
  }

  /**
  * Función que filtra la lista la entidad por nombre, utilizando un valor de búsqueda.
  * @param value Valor de búsqueda.
  * @returns Lista filtrada de la entidad.
  */
  private filterParroquia(value: string): Dependencia[] {
    return CommonUtilsModal.filterEntitiesByName(this.listParroquia, 'nombre', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedParroquia(event: MatAutocompleteSelectedEvent): void {
    const selectedParroquia = event.option.value as Dependencia;
    this.control.setValue(selectedParroquia.nombre);
    this.setupCircuito((selectedParroquia.jerarquia.codigo + 1), selectedParroquia.codigo);
    this.formulario.get('dependencia2')?.setValue('');
    this.formulario.get('dependencia3')?.setValue('');
    this.listPAsociado = [];
    this.listFAsociado = [];
  }
  /**
* Evento que se dispara cuando el valor del campo de autocompletado cambia.
* @param event Evento de cambio del campo de autocompletado.
*/
  onInputValueChangedCircuito(event: Event): void {
    const inputText = (event.target as HTMLInputElement)?.value;
    const normalizedInput = inputText ? inputText.trim() : '';
    if (normalizedInput) {
      this.filteredCircuito = of(this.listCircuito).pipe(
        map(listCircuito =>
          listCircuito.filter(obj =>
            CommonUtilsModal.normalizeValue(obj.nombre).includes(CommonUtilsModal.normalizeValue(normalizedInput))
          )
        )
      );
    } else {
      this.filteredCircuito = of(this.listCircuito);
    }
  }

  /**
  * Función que filtra la lista la entidad por nombre, utilizando un valor de búsqueda.
  * @param value Valor de búsqueda.
  * @returns Lista filtrada de la entidad.
  */
  private filterCircuito(value: string): Dependencia[] {
    return CommonUtilsModal.filterEntitiesByName(this.listCircuito, 'nombre', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedCircuito(event: MatAutocompleteSelectedEvent): void {
    const selectedCircuito = event.option.value as Dependencia;
    this.control.setValue(selectedCircuito.nombre);
    this.setupSubCircuito((selectedCircuito.jerarquia.codigo + 1), selectedCircuito.codigo);
    this.formulario.get('dependencia3')?.setValue('');
    this.listPAsociado = [];
    this.listFAsociado = [];
  }
  /**
* Evento que se dispara cuando el valor del campo de autocompletado cambia.
* @param event Evento de cambio del campo de autocompletado.
*/
  onInputValueChangedSubCircuito(event: Event): void {
    const inputText = (event.target as HTMLInputElement)?.value;
    const normalizedInput = inputText ? inputText.trim() : '';
    if (normalizedInput) {
      this.filteredSubCircuito = of(this.listSubCircuito).pipe(
        map(listSubCircuito =>
          listSubCircuito.filter(obj =>
            CommonUtilsModal.normalizeValue(obj.nombre).includes(CommonUtilsModal.normalizeValue(normalizedInput))
          )
        )
      );
    } else {
      this.filteredSubCircuito = of(this.listSubCircuito);
    }
  }

  /**
  * Función que filtra la lista la entidad por nombre, utilizando un valor de búsqueda.
  * @param value Valor de búsqueda.
  * @returns Lista filtrada de la entidad.
  */
  private filterSubCircuito(value: string): Dependencia[] {
    return CommonUtilsModal.filterEntitiesByName(this.listSubCircuito, 'nombre', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedSubCircuito(event: MatAutocompleteSelectedEvent): void {
    const selectedSubCircuito = event.option.value as Dependencia;
    this.control.setValue(selectedSubCircuito.nombre);
    this.vinFlotaSubCircuitoService.getElemtsform().subscribe(listFlota => {
      this.listFAsociado = listFlota.filter(entity => entity.dependencia.codigo === selectedSubCircuito.codigo);
    });
    this.listPAsociado = [];
  }

  onSelectionChange(event: MatSelectionListChange) {
    const selectedOption = event.options[0];
    // Desseleccionar las otras opciones
    event.source.options.toArray().forEach(option => {
      if (option !== selectedOption) {
        option.selected = false;
      }
      if (option.selected) {
        this.vinPersonalSubCircuitoService.getElemtsform().subscribe(listFlota => {
          this.listPAsociado = listFlota.filter(entity => entity.dependencia.codigo === selectedOption.value?.dependencia?.codigo);
        });
      }
      else {
        this.listPAsociado = [];
      }

    });
  }
  onSelectionChangeFor4(event: MatSelectionListChange) {
    const selectedOptions = event.source.selectedOptions.selected;

    // Deshabilitar las opciones que exceden el límite de selección
    event.source.options.toArray().forEach(option => {
      option.disabled = selectedOptions.length >= MAX_SELECTION && !option.selected;
    });
  }
}
