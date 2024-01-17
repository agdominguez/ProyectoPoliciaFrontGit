import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { DependenciaService } from '../services/services-dependencias/dependencia.service';
import { Dependencia } from '../entities/dependencias/dependencia';
import { Observable, Subscription, map, of } from 'rxjs';
import { CommonUtilsModal } from '../generics_methods/CommonUtilsModal';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { TipoReclamo } from '../entities/personas/TipoReclamo';
import { TipoReclamoService } from '../services/services-personas/tipo-reclamo.service';
import { SugerenciaService } from '../services/services-personas/sugerencia.service';
import Swal from 'sweetalert2';
import { Sugerencia } from '../entities/personas/Sugerencia';

@Component({
  selector: 'app-sugerencias',
  templateUrl: './sugerencias.component.html',
  styleUrls: ['./sugerencias.component.css']
})
export class SugerenciasComponent {

  control = new FormControl('');

  reclamoForm!: FormGroup;

  /**
  * Formulario reactivo para manejar los datos de la flotaVehicular.
  */
  public errores!: string[];

  /**
  * Array de suscripciones para gestionar la destrucción de las mismas en el ciclo de vida del componente.
  */
  private subscriptions: Subscription[] = [];

  constructor(private fb: FormBuilder,
    private dependenciaService: DependenciaService,
    private tipoReclamoService: TipoReclamoService,
    private sugerenciaService: SugerenciaService
  ) { }

  // Observable para filtrar y mostrar las opciones
  filteredDependencia!: Observable<Dependencia[]>;
  filteredSubCircuito!: Observable<Dependencia[]>;
  filteredTipoReclamo!: Observable<TipoReclamo[]>;

  // Función para mostrar el nombre en el campo de autocompletado
  displayDependencia(dependencia: Dependencia): string {
    return dependencia.nombre || '';
  }
  displaySubCircuito(dependencia: Dependencia): string {
    return dependencia?.nombre || '';
  }
  displayTipoReclamo(tipo: TipoReclamo): string {
    return tipo?.nombre || '';
  }

  public listDependencia!: Dependencia[];
  public listSubCircuito!: Dependencia[];
  public listTipoReclamo!: TipoReclamo[];

  ngOnInit() {
    this.setupDependencia(5);
    this.setupTipoReclamo();
    this.initForm();
  }

  initForm() {
    this.reclamoForm = this.fb.group({
      circuito: ['',
        [Validators.required,
        CommonUtilsModal.validatorDDL('nombre')
        ]],
      subcircuito: ['',
        [Validators.required,
        CommonUtilsModal.validatorDDL('nombre')
        ]],
      tipoReclamo: ['',
        [Validators.required,
        CommonUtilsModal.validatorDDL('nombre')
        ]],
      detalle: ['', Validators.required],
      contacto: [''],
      apellidos: ['', Validators.required],
      nombres: ['', Validators.required]
    });
  }

  setupTipoReclamo(): void {
    this.tipoReclamoService.getElemtsformPublic().subscribe(list => {

      this.listTipoReclamo = list;
      this.filteredTipoReclamo = of(this.listTipoReclamo).pipe(
        map(value => this.filterTipoReclamo(''))
      );
    });
  }

  setupDependencia(jerarquia: number): void {
    this.dependenciaService.getElemtsformPublic().subscribe(list => {

      this.listDependencia = list.filter(entity => entity.jerarquia.codigo === jerarquia);
      this.filteredDependencia = of(this.listDependencia).pipe(
        map(value => this.filterDependencia(''))
      );
    });
  }

  setupSubCircuito(jerarquia: number, dependenciaPadre: number): void {
    this.dependenciaService.getElemtsformPublic().subscribe(list => {

      this.listSubCircuito = list.filter(entity => entity.jerarquia.codigo === jerarquia &&
        entity.dependenciaPadre.codigo === dependenciaPadre);
      this.filteredSubCircuito = of(this.listSubCircuito).pipe(
        map(value => this.filterSubCircuito(''))
      );
    });
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
    const selectedCircuito = event.option.value as Dependencia;
    this.control.setValue(selectedCircuito.nombre);
    this.setupSubCircuito((selectedCircuito.jerarquia.codigo + 1), selectedCircuito.codigo);
    this.reclamoForm.get('subcircuito')?.setValue('');

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
  }

  /**
* Evento que se dispara cuando el valor del campo de autocompletado cambia.
* @param event Evento de cambio del campo de autocompletado.
*/
  onInputValueChangedTipoReclamo(event: Event): void {
    const inputText = (event.target as HTMLInputElement)?.value;
    const normalizedInput = inputText ? inputText.trim() : '';
    if (normalizedInput) {
      this.filteredTipoReclamo = of(this.listTipoReclamo).pipe(
        map(listTipoReclamo =>
          listTipoReclamo.filter(obj =>
            CommonUtilsModal.normalizeValue(obj.nombre).includes(CommonUtilsModal.normalizeValue(normalizedInput))
          )
        )
      );
    } else {
      this.filteredTipoReclamo = of(this.listTipoReclamo);
    }
  }

  /**
  * Función que filtra la lista la entidad por nombre, utilizando un valor de búsqueda.
  * @param value Valor de búsqueda.
  * @returns Lista filtrada de la entidad.
  */
  private filterTipoReclamo(value: string): TipoReclamo[] {
    return CommonUtilsModal.filterEntitiesByName(this.listTipoReclamo, 'nombre', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedTipoReclamo(event: MatAutocompleteSelectedEvent): void {
    const selectedTipo = event.option.value as TipoReclamo;
    this.control.setValue(selectedTipo.nombre);
  }

  /**
 * Método que se encarga de agregar o actualizar la flotaVehicular, dependiendo de si el código es -1 o no.
 */
  agregar() {
    if (this.reclamoForm.valid) {
      this.create();
    }
  }

  /**
  * Método que realiza la creación de una nueva sugerencia.
  */
  public create(): void {

    const sub = this.sugerenciaService.createPublic(this.createSugerencia()).subscribe(
      {
        next: (json: any) => {
          Swal.fire('Nuevo Elemento', `${json.mensaje}: ${json.elemento.tipoReclamo.nombre}`, 'success');
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

  createSugerencia() {
    const sugerencia = new Sugerencia();
    sugerencia.codigo = -1;
    sugerencia.dependencia = this.reclamoForm.value.subcircuito;
    sugerencia.tipoReclamo = this.reclamoForm.value.tipoReclamo;
    sugerencia.detalle = this.reclamoForm.value.detalle;
    sugerencia.contacto = this.reclamoForm.value.contacto;
    sugerencia.apellidos = this.reclamoForm.value.apellidos;
    sugerencia.nombres = this.reclamoForm.value.nombres;
    sugerencia.eliminado = 'N';
    sugerencia.fecha = new Date();

    return sugerencia;
  }
}
