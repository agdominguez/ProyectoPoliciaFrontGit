import { Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription, map, of } from 'rxjs';
import { Dependencia } from 'src/app/entities/dependencias/dependencia';
import { JerarquiaDependencia } from 'src/app/entities/dependencias/jerarquiaDependencia';
import { CommonUtilsModal } from 'src/app/generics_methods/CommonUtilsModal';
import { DependenciaService } from 'src/app/services/services-dependencias/dependencia.service';
import { JerarquiaDependenciaService } from 'src/app/services/services-dependencias/jerarquia-dependencia.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-dependencia',
  templateUrl: './modal-dependencia.component.html',
  styleUrls: ['./modal-dependencia.component.css']
})
export class ModalDependenciaComponent {

  control = new FormControl('');

  /**
  * Dependencia recibida como entrada para mostrar o actualizar los datos.
  */
  @Input() public dependencia!: Dependencia;

  /**
  * Título del modal.
  */
  public titulo: string = 'Dependencia';

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
  filteredJerarquia!: Observable<JerarquiaDependencia[]>;
  filteredDependencia!: Observable<Dependencia[]>;

  // Función para mostrar el nombre en el campo de autocompletado
  displayJerarquia(jerarquiaDependencia: JerarquiaDependencia): string {
    return jerarquiaDependencia.nombre || '';
  }
  displayDependencia(dependencia: Dependencia): string {
    return dependencia.nombre || '';
  }

  public listJerarquiaDependencia!: JerarquiaDependencia[];
  public listDependencia!: Dependencia[];

  constructor(
    private formBuilder: FormBuilder,
    private dependenciaService: DependenciaService,
    private jerarquiaDependenciaService: JerarquiaDependenciaService,
    private dialogRef: MatDialogRef<ModalDependenciaComponent>,
  ) {
    // Inicializa dependencia si es null
    if (!this.dependencia) {
      this.dependencia = {
        codigo: -1,
        nombre: '',
        siglas: '',
        jerarquia: new JerarquiaDependencia(),
        dependenciaPadre: new Dependencia(),
        codigoCircuitoSubcircuito: '',
        eliminado: 'N'

      };
    }
  }

  /**
  * Método que se ejecuta al inicializar el componente.
  */
  ngOnInit(): void {

    this.setupJerarquiaDependencia();

    this.formulario = this.formBuilder.group({
      codigo: [this.dependencia?.codigo || -1],
      nombre: [this.dependencia?.nombre || '',
      [Validators.required,
      this.transformToUppercaseValidator(),
        //this.noSymbolsValidator()
      ]],
      siglas: [this.dependencia.siglas || '',
      [Validators.required,
      this.transformToUppercaseValidator(),
      this.noSymbolsValidator()
      ]],
      jerarquia: [this.dependencia.jerarquia || '',
      [Validators.required,
      CommonUtilsModal.validatorDDL('nombre')
      ]],
      dependenciaPadre: [this.dependencia.dependenciaPadre || ''],
      codigoCircuitoSubcircuito: [this.dependencia.codigoCircuitoSubcircuito || ''],
      eliminado: [this.dependencia?.eliminado || 'N']
    });
  }

  setupJerarquiaDependencia(): void {
    this.jerarquiaDependenciaService.getElemtsform().subscribe(list => {

      this.listJerarquiaDependencia = list;
      this.filteredJerarquia = of(this.listJerarquiaDependencia).pipe(
        map(value => this.jerarquiaDependencia(''))
      );
    });
  }

  setupDependencia(codigo: number): void {
    this.dependenciaService.getElemtsform().subscribe(list => {

      this.listDependencia = list;
      const listDepedenciaPadre = this.listDependencia.filter(entity => entity.jerarquia.codigo == (codigo - 1));
      this.listDependencia = listDepedenciaPadre;
      this.filteredDependencia = of(this.listDependencia);
      this.formulario.get('dependenciaPadre')?.setValue('');
    });
  }

  /**
  * Método que se ejecuta al destruir el componente.
  */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
  * Método que se encarga de agregar o actualizar la dependencia, dependiendo de si el código es -1 o no.
  */
  agregar() {
    if (this.formulario.valid) {
      if (this.formulario.value.codigo == -1) {
        this.create();
      } else {
        this.update();
      }
    }
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
   * Método que realiza la creación de una nueva dependencia.
   */
  public create(): void {
    const sub = this.dependenciaService.create(this.formulario.value).subscribe(
      {
        next: (json: any) => {
          this.dependencia.eliminado = "N";
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

  /**
   * Método que realiza la actualización de la dependencia.
   */
  public update(): void {
    if (this.formulario.valid) {
      const sub = this.dependenciaService.update(this.formulario.value)
        .subscribe({
          next: elemento => {
            Swal.fire('Elemento Actualizado', `Elemento ${elemento.nombre} actualizado con exito!`, 'success');
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
  }

  /**
  * Validador personalizado para transformar el texto a mayúsculas.
  * @returns Función validadora.
  */
  private transformToUppercaseValidator(): ValidatorFn {
    return (control: AbstractControl): Promise<any> | null => {
      const transformedValue = control.value.toUpperCase();
      if (transformedValue !== control.value) {
        control.patchValue(transformedValue, { emitEvent: false });
      }
      return null;
    };
  }

  /**
   * Validador personalizado para aceptar caracteres y espacios y omitir símbolos.
   * @returns Función validadora.
   */
  private noSymbolsValidator(): ValidatorFn {
    const alphanumericPattern = /^[a-zA-Z0-9\s]*$/;
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      const hasSymbols = !alphanumericPattern.test(value);
      if (hasSymbols) {
        return { hasSymbols: true };
      }

      return null;
    };
  }

  /**
* Evento que se dispara cuando el valor del campo de autocompletado cambia.
* @param event Evento de cambio del campo de autocompletado.
*/
  onInputValueChangedJerarquia(event: Event): void {
    const inputText = (event.target as HTMLInputElement)?.value;
    const normalizedInput = inputText ? inputText.trim() : '';
    if (normalizedInput) {
      this.filteredJerarquia = of(this.listJerarquiaDependencia).pipe(
        map(listJerarquiaDependencia =>
          listJerarquiaDependencia.filter(obj =>
            CommonUtilsModal.normalizeValue(obj.nombre).includes(CommonUtilsModal.normalizeValue(normalizedInput))
          )
        )
      );
    } else {
      this.filteredJerarquia = of(this.listJerarquiaDependencia);
    }
  }

  /**
* Función que filtra la lista la entidad por nombre, utilizando un valor de búsqueda.
* @param value Valor de búsqueda.
* @returns Lista filtrada de la entidad.
*/
  private jerarquiaDependencia(value: string): JerarquiaDependencia[] {
    return CommonUtilsModal.filterEntitiesByName(this.listJerarquiaDependencia, 'nombre', value);
  }

  /**
* Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
* @param event Evento de selección de autocompletado.
*/
  onOptionSelectedJerarquia(event: MatAutocompleteSelectedEvent): void {
    const selectedJerarquia = event.option.value as JerarquiaDependencia;
    this.control.setValue(selectedJerarquia.nombre);

    this.setupDependencia(selectedJerarquia.codigo);
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
  private dependencias(value: string): Dependencia[] {
    return CommonUtilsModal.filterEntitiesByName(this.listDependencia, 'nombre', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedDepedencia(event: MatAutocompleteSelectedEvent): void {
    const selectedDepedenciaPadre = event.option.value as Dependencia;
    this.control.setValue(selectedDepedenciaPadre.nombre);

  }

}
