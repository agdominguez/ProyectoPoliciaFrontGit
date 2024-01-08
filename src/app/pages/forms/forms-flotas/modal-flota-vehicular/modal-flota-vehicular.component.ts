import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription, map, of } from 'rxjs';
import { FlotaVehicular } from 'src/app/entities/flotas/FlotaVehicular';
import { TipoVehiculo } from 'src/app/entities/flotas/TipoVehiculo';
import { CommonUtilsModal } from 'src/app/generics_methods/CommonUtilsModal';
import { FlotaVehicularService } from 'src/app/services/services-flotas/flota-vehicular.service';
import { TipoVehiculoService } from 'src/app/services/services-flotas/tipo-vehiculo.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-flota-vehicular',
  templateUrl: './modal-flota-vehicular.component.html',
  styleUrls: ['./modal-flota-vehicular.component.css']
})
export class ModalFlotaVehicularComponent implements OnInit {

  control = new FormControl('');

  /**
  * FlotaVehicular recibida como entrada para mostrar o actualizar los datos.
  */
  @Input() public flotaVehicular!: FlotaVehicular;

  /**
  * Título del modal.
  */
  public titulo: string = 'Flota Vehicular';

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
  filteredTipoVehiculo!: Observable<TipoVehiculo[]>;

  // Función para mostrar el nombre en el campo de autocompletado
  displayTipoVehiculo(tipoVehiculo: TipoVehiculo): string {
    return tipoVehiculo.tipo || '';
  }

  public listTipoVehiculo!: TipoVehiculo[];

  constructor(
    private formBuilder: FormBuilder,
    private empresaService: FlotaVehicularService,
    private tipoVehiculoService: TipoVehiculoService,
    private dialogRef: MatDialogRef<ModalFlotaVehicularComponent>,
  ) {
    // Inicializa flotaVehicular si es null
    if (!this.flotaVehicular) {
      this.flotaVehicular = {
        codigo: -1,
        placa: '',
        chasis: '',
        marca: '',
        modelo: '',
        motor: '',
        kilometraje: 0,
        cilindraje: 0,
        capacidadCarga: 0,
        capacidadPasajeros: 0,
        fechaIngreso: new Date(),
        eliminado: 'N',
        tipoVehiculo: new TipoVehiculo()
      };
    }
  }

  /**
  * Método que se ejecuta al inicializar el componente.
  */
  ngOnInit(): void {

    this.setupTipoVehiculo();

    this.formulario = this.formBuilder.group({
      codigo: [this.flotaVehicular?.codigo || -1],
      tipoVehiculo: [this.flotaVehicular.tipoVehiculo || '',
      [Validators.required,
      CommonUtilsModal.validatorDDL('tipo')
      ]],
      placa: [
        this.flotaVehicular?.placa || '',
        [Validators.required,
        this.transformToUppercaseValidator(),
        this.noSymbolsValidator()
        ]],
      chasis: [this.flotaVehicular?.chasis || '',
      [Validators.required,
      this.transformToUppercaseValidator(),
      this.noSymbolsValidator()
      ]],
      marca: [this.flotaVehicular?.marca || '',
      [Validators.required,
      this.transformToUppercaseValidator(),
      this.noSymbolsValidator()
      ]],
      modelo: [this.flotaVehicular?.modelo || '',
      [Validators.required,
      this.transformToUppercaseValidator()
      ]],
      motor: [this.flotaVehicular?.motor || '',
      [Validators.required,
      this.transformToUppercaseValidator(),
      this.noSymbolsValidator()
      ]],
      kilometraje: [this.flotaVehicular?.kilometraje || 0,
      [Validators.required,
      this.mayorA0Validator
      ]],
      cilindraje: [this.flotaVehicular?.cilindraje || 0,
      [Validators.required,
      this.mayorA0Validator
      ]],
      capacidadCarga: [this.flotaVehicular?.capacidadCarga || 0,
      [Validators.required,
      this.mayorA0Validator
      ]],
      capacidadPasajeros: [this.flotaVehicular?.capacidadPasajeros || 0,
      [Validators.required,
      this.mayorA0Validator
      ]],
      fechaIngreso: new Date().toISOString(),
      eliminado: [this.flotaVehicular?.eliminado || 'N']
    });
  }

  setupTipoVehiculo(): void {
    this.tipoVehiculoService.getElemtsform().subscribe(list => {

      this.listTipoVehiculo = list;
      this.filteredTipoVehiculo = of(this.listTipoVehiculo).pipe(
        map(value => this.tipoVehiculo(''))
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
  * Método que se encarga de agregar o actualizar la flotaVehicular, dependiendo de si el código es -1 o no.
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
   * Método que realiza la creación de una nueva flotaVehicular.
   */
  public create(): void {
    const sub = this.empresaService.create(this.formulario.value).subscribe(
      {
        next: (json: any) => {
          this.flotaVehicular.eliminado = "N";
          Swal.fire('Nuevo Elemento', `${json.mensaje}: ${json.elemento.placa}`, 'success');
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
   * Método que realiza la actualización de la flotaVehicular.
   */
  public update(): void {
    if (this.formulario.valid) {
      const sub = this.empresaService.update(this.formulario.value)
        .subscribe({
          next: elemento => {
            Swal.fire('Elemento Actualizado', `Elemento ${elemento.codigo} actualizado con exito!`, 'success');
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
  onInputValueChangedTipoVehiculo(event: Event): void {
    const inputText = (event.target as HTMLInputElement)?.value;
    const normalizedInput = inputText ? inputText.trim() : '';
    if (normalizedInput) {
      this.filteredTipoVehiculo = of(this.listTipoVehiculo).pipe(
        map(listTipoVehiculo =>
          listTipoVehiculo.filter(obj =>
            CommonUtilsModal.normalizeValue(obj.tipo).includes(CommonUtilsModal.normalizeValue(normalizedInput))
          )
        )
      );
    } else {
      this.filteredTipoVehiculo = of(this.listTipoVehiculo);
    }
  }

  /**
* Función que filtra la lista la entidad por nombre, utilizando un valor de búsqueda.
* @param value Valor de búsqueda.
* @returns Lista filtrada de la entidad.
*/
  private tipoVehiculo(value: string): TipoVehiculo[] {
    return CommonUtilsModal.filterEntitiesByName(this.listTipoVehiculo, 'tipo', value);
  }

  /**
* Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
* @param event Evento de selección de autocompletado.
*/
  onOptionSelectedTipoVehiculo(event: MatAutocompleteSelectedEvent): void {
    const selectedTipo = event.option.value as TipoVehiculo;
    this.control.setValue(selectedTipo.tipo);
  }

}
