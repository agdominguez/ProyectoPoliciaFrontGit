import { DependenciaService } from 'src/app/services/services-dependencias/dependencia.service';
import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription, map, of } from 'rxjs';
import { Dependencia } from 'src/app/entities/dependencias/dependencia';
import { Armamento } from 'src/app/entities/mantenimientos/Armamento';
import { CommonUtilsModal } from 'src/app/generics_methods/CommonUtilsModal';
import Swal from 'sweetalert2';
import { ArmamentoService } from 'src/app/services/services-mantenimientos/armamento.service';

@Component({
  selector: 'app-modal-armamento',
  templateUrl: './modal-armamento.component.html',
  styleUrls: ['./modal-armamento.component.css']
})
export class ModalArmamentoComponent implements OnInit {

  control = new FormControl('');

  /**
  * Armamento recibida como entrada para mostrar o actualizar los datos.
  */
  @Input() public armamento!: Armamento;

  /**
  * Título del modal.
  */
  public titulo: string = 'Armamento';

  /**
  * Formulario reactivo para manejar los datos de la armamento.
  */
  public formulario!: FormGroup;

  /**
  * Formulario reactivo para manejar los datos de la armamento.
  */
  public errores!: string[];

  /**
  * Array de suscripciones para gestionar la destrucción de las mismas en el ciclo de vida del componente.
  */
  private subscriptions: Subscription[] = [];

  // Observable para filtrar y mostrar las opciones
  filteredDependencia!: Observable<Dependencia[]>;

  // Función para mostrar el nombre en el campo de autocompletado
  displayDependencia(dependencia: Dependencia): string {
    return dependencia.nombre || '';
  }
  public listDependencia!: Dependencia[];

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ModalArmamentoComponent>,
    private dependenciaService: DependenciaService,
    private armamentoService: ArmamentoService
  ) {
    // Inicializa armamento si es null
    if (!this.armamento) {
      this.armamento = {
        codigo: -1,
        tipoArma: '',
        dependencia: new Dependencia(),
        nombre: '',
        descripcion: '',
        codigoArma: '',
        eliminado: 'N'

      };
    }
  }

  /**
  * Método que se ejecuta al inicializar el componente.
  */
  ngOnInit(): void {

    this.setupDependencia();

    this.formulario = this.formBuilder.group({
      codigo: [this.armamento?.codigo || -2,],
      tipoArma: [this.armamento?.tipoArma || '', [
        Validators.required,
        this.transformToUppercaseValidator()]],
      dependencia: [this.armamento?.dependencia || null, [Validators.required,
      CommonUtilsModal.validatorDDL('nombre')
      ]],
      nombre: [this.armamento?.nombre || '', [
        Validators.required,
        this.transformToUppercaseValidator()]],
      descripcion: [this.armamento?.descripcion || '', [
        Validators.required,
        this.transformToUppercaseValidator()]],
      codigoArma: [this.armamento?.codigoArma || '', [
        Validators.required,
        this.transformToUppercaseValidator()]],
      eliminado: [this.armamento?.eliminado || 'N']
    });
  }

  setupDependencia(): void {
    this.dependenciaService.getElemtsform().subscribe(list => {

      this.listDependencia = list.filter(ciudad => ciudad.jerarquia.codigo == 3);
      this.filteredDependencia = of(this.listDependencia).pipe(
        map(value => this.dependencia(''))
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
  * Método que se encarga de agregar o actualizar la armamento, dependiendo de si el código es -1 o no.
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
   * Método que realiza la creación de una nueva armamento.
   */
  public create(): void {
    const sub = this.armamentoService.create(this.formulario.value).subscribe(
      {
        next: (json: any) => {
          this.armamento.eliminado = "N";
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
   * Método que realiza la actualización de la armamento.
   */
  public update(): void {
    if (this.formulario.valid) {
      const sub = this.armamentoService.update(this.formulario.value)
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
  private dependencia(value: string): Dependencia[] {
    return CommonUtilsModal.filterEntitiesByName(this.listDependencia, 'nombre', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedDependencia(event: MatAutocompleteSelectedEvent): void {
    const selectedDepCiudad = event.option.value as Dependencia;
    this.control.setValue(selectedDepCiudad.nombre);
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

}
