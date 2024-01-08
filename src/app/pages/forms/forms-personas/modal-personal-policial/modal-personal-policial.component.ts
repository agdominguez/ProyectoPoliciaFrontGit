import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription, map, of } from 'rxjs';
import { Dependencia } from 'src/app/entities/dependencias/dependencia';
import { PersonalPolicial } from 'src/app/entities/personas/PersonalPolicial';
import { RangoPolicial } from 'src/app/entities/personas/RangoPolicial';
import { TipoSangre } from 'src/app/entities/personas/TipoSangre';
import { APP_DATE_FORMATS, AppDateAdapter } from 'src/app/generics_methods/AppDateAdapter';
import { CommonUtilsModal } from 'src/app/generics_methods/CommonUtilsModal';
import { DependenciaService } from 'src/app/services/services-dependencias/dependencia.service';
import { PersonalPolicialService } from 'src/app/services/services-personas/personal-policial.service';
import { RangoPolicialService } from 'src/app/services/services-personas/rango-policial.service';
import { TipoSangreService } from 'src/app/services/services-personas/tipo-sangre.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-personal-policial',
  templateUrl: './modal-personal-policial.component.html',
  styleUrls: ['./modal-personal-policial.component.css'],
  providers: [
    {
      provide: DateAdapter, useClass: AppDateAdapter
    },
    {
      provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS
    }
  ]
})
export class ModalPersonalPolicialComponent implements OnInit {


  control = new FormControl('');

  /**
  * PersonalPolicial recibida como entrada para mostrar o actualizar los datos.
  */
  @Input() public personalPolicial!: PersonalPolicial;

  /**
  * Título del modal.
  */
  public titulo: string = 'Personal Policial';

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
  filteredRangoPolicial!: Observable<RangoPolicial[]>;
  filteredDependencia!: Observable<Dependencia[]>;
  filteredTipoSangre!: Observable<TipoSangre[]>;

  // Función para mostrar el nombre en el campo de autocompletado
  displayRango(rangoPolicial: RangoPolicial): string {
    return rangoPolicial.nombreRango || '';
  }
  displayDependencia(dependencia: Dependencia): string {
    return dependencia.nombre || '';
  }
  displayTipoSangre(tipoSangre: TipoSangre): string {
    return tipoSangre.nombre || '';
  }

  public listRangoPolicial!: RangoPolicial[];
  public listDependencia!: Dependencia[];
  public listTipoSangre!: TipoSangre[];

  constructor(
    private formBuilder: FormBuilder,
    private personalPolicialService: PersonalPolicialService,
    private rangoPolicialService: RangoPolicialService,
    private dependenciaService: DependenciaService,
    private tipoSangreService: TipoSangreService,
    private dialogRef: MatDialogRef<ModalPersonalPolicialComponent>,
  ) {
    // Inicializa personalPolicial si es null
    if (!this.personalPolicial) {
      this.personalPolicial = {
        codigo: -1,
        identificacion: '',
        nombreCompleto: '',
        fechaNacimiento: new Date(),
        tipoSangre: new TipoSangre(),
        ciudadNacimiento: new Dependencia(),
        telefonoCelular: '',
        rango: new RangoPolicial(),
        fechaIngreso: new Date(),
        eliminado: 'N'
      };
    }
  }

  /**
  * Método que se ejecuta al inicializar el componente.
  */
  ngOnInit(): void {

    this.setupRangoPolicial();
    this.setupDependenciaCiudad();
    this.setupTipoSangre();

    this.formulario = this.formBuilder.group({
      codigo: [this.personalPolicial?.codigo || -1],
      identificacion: [this.personalPolicial?.identificacion || '',
      Validators.required,
      CommonUtilsModal.cedulaAsyncValidator()
      ],
      nombreCompleto: [this.personalPolicial?.nombreCompleto || '',
      [Validators.required,
      this.transformToUppercaseValidator(),
      this.noSymbolsValidator()
      ]],
      fechaNacimiento: [this.personalPolicial?.fechaNacimiento || new Date()],
      tipoSangre: [this.personalPolicial?.tipoSangre || '',
      [Validators.required,
      CommonUtilsModal.validatorDDL('nombre')
      ]],
      ciudadNacimiento: [this.personalPolicial?.ciudadNacimiento || '',
      [Validators.required,
      CommonUtilsModal.validatorDDL('nombre')
      ]],
      telefonoCelular: [this.personalPolicial?.telefonoCelular || '',
      [Validators.required]],
      rango: [this.personalPolicial?.rango || '',
      [Validators.required,
      CommonUtilsModal.validatorDDL('nombreRango')
      ]],
      fechaIngreso: [this.personalPolicial?.fechaIngreso || new Date()],
      eliminado: [this.personalPolicial?.eliminado || 'N']
    });
  }

  setupRangoPolicial(): void {
    this.rangoPolicialService.getElemtsform().subscribe(list => {

      this.listRangoPolicial = list;
      this.filteredRangoPolicial = of(this.listRangoPolicial).pipe(
        map(value => this.rangoPolicial(''))
      );
    });
  }
  setupDependenciaCiudad(): void {
    this.dependenciaService.getElemtsform().subscribe(list => {

      this.listDependencia = list.filter(ciudad => ciudad.jerarquia.codigo == 3);
      this.filteredDependencia = of(this.listDependencia).pipe(
        map(value => this.dependenciaCiudad(''))
      );
    });
  }

  setupTipoSangre(): void {
    this.tipoSangreService.getElemtsform().subscribe(list => {

      this.listTipoSangre = list;
      this.filteredTipoSangre = of(this.listTipoSangre).pipe(
        map(value => this.tipoSangre(''))
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
   * Método que realiza la creación de una nueva personalPolicial.
   */
  public create(): void {
    const sub = this.personalPolicialService.create(this.formulario.value).subscribe(
      {
        next: (json: any) => {
          this.personalPolicial.eliminado = "N";
          Swal.fire('Nuevo Elemento', `${json.mensaje}: ${json.elemento.nombreCompleto}`, 'success');
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
   * Método que realiza la actualización de la personalPolicial.
   */
  public update(): void {
    if (this.formulario.valid) {
      const sub = this.personalPolicialService.update(this.formulario.value)
        .subscribe({
          next: elemento => {
            Swal.fire('Elemento Actualizado', `Elemento ${elemento.nombreCompleto} actualizado con exito!`, 'success');
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

  private mayorA0Validator(control: AbstractControl): { [key: string]: any } | null {
    const value = control.value;

    if (value !== null && value !== undefined && value <= 10) {
      return { 'mayorA0Validator': true };
    }

    return null;
  }


  /**
* Evento que se dispara cuando el valor del campo de autocompletado cambia.
* @param event Evento de cambio del campo de autocompletado.
*/
  onInputValueChangedRango(event: Event): void {
    const inputText = (event.target as HTMLInputElement)?.value;
    const normalizedInput = inputText ? inputText.trim() : '';
    if (normalizedInput) {
      this.filteredRangoPolicial = of(this.listRangoPolicial).pipe(
        map(listRangoPolicial =>
          listRangoPolicial.filter(obj =>
            CommonUtilsModal.normalizeValue(obj.nombreRango).includes(CommonUtilsModal.normalizeValue(normalizedInput))
          )
        )
      );
    } else {
      this.filteredRangoPolicial = of(this.listRangoPolicial);
    }
  }

  /**
  * Función que filtra la lista la entidad por nombre, utilizando un valor de búsqueda.
  * @param value Valor de búsqueda.
  * @returns Lista filtrada de la entidad.
  */
  private rangoPolicial(value: string): RangoPolicial[] {
    return CommonUtilsModal.filterEntitiesByName(this.listRangoPolicial, 'nombreRango', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedRango(event: MatAutocompleteSelectedEvent): void {
    const selectedRango = event.option.value as RangoPolicial;
    this.control.setValue(selectedRango.nombreRango);
  }
  /**
* Evento que se dispara cuando el valor del campo de autocompletado cambia.
* @param event Evento de cambio del campo de autocompletado.
*/
  onInputValueChangedDepCiudad(event: Event): void {
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
  private dependenciaCiudad(value: string): Dependencia[] {
    return CommonUtilsModal.filterEntitiesByName(this.listDependencia, 'nombre', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedDepCiudad(event: MatAutocompleteSelectedEvent): void {
    const selectedDepCiudad = event.option.value as Dependencia;
    this.control.setValue(selectedDepCiudad.nombre);
  }

  /**
* Evento que se dispara cuando el valor del campo de autocompletado cambia.
* @param event Evento de cambio del campo de autocompletado.
*/
  onInputValueChangedTipoSangre(event: Event): void {
    const inputText = (event.target as HTMLInputElement)?.value;
    const normalizedInput = inputText ? inputText.trim() : '';
    if (normalizedInput) {
      this.filteredTipoSangre = of(this.listTipoSangre).pipe(
        map(listTipoSangre =>
          listTipoSangre.filter(obj =>
            CommonUtilsModal.normalizeValue(obj.nombre).includes(CommonUtilsModal.normalizeValue(normalizedInput))
          )
        )
      );
    } else {
      this.filteredTipoSangre = of(this.listTipoSangre);
    }
  }

  /**
  * Función que filtra la lista la entidad por nombre, utilizando un valor de búsqueda.
  * @param value Valor de búsqueda.
  * @returns Lista filtrada de la entidad.
  */
  private tipoSangre(value: string): TipoSangre[] {
    return CommonUtilsModal.filterEntitiesByName(this.listTipoSangre, 'nombre', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedTipoSangre(event: MatAutocompleteSelectedEvent): void {
    const selectedTipoSangre = event.option.value as TipoSangre;
    this.control.setValue(selectedTipoSangre.nombre);
  }


  /**
   * Método que valida los caracteres ingresados en el campo de nombre.
   * @param event El evento del teclado.
   */
  onKeyPress(event: KeyboardEvent): void {
    const char = event.key;
    // Validar si el carácter es un número
    const isNumber = /^[0-9]+$/.test(char);

    // Evitar la acción del evento si no es un número ni la tecla Enter
    if (!isNumber && char !== 'Enter') {
      event.preventDefault();
    }
    // Si es la tecla Enter y el campo es válido, realizar acciones
    // if (char === 'Enter' && this.firstFormGroup.get('searchModalValue')?.valid) {
    //   this.stepper.next();
    //   event.preventDefault();
    // }
  }
}
