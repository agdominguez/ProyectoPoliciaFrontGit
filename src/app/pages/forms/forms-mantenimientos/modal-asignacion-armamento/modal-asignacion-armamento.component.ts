import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialogRef } from '@angular/material/dialog';
import { MatListOption, MatSelectionList } from '@angular/material/list';
import { Observable, Subscription, map, of } from 'rxjs';
import { VinculacionPersonalSubcircuito } from 'src/app/entities/dependencias/VinculacionPersonalSubcircuito';
import { Armamento } from 'src/app/entities/mantenimientos/Armamento';
import { AsignacionArmamento } from 'src/app/entities/mantenimientos/AsignacionArmamento';
import { PersonalPolicial } from 'src/app/entities/personas/PersonalPolicial';
import { CommonUtilsModal } from 'src/app/generics_methods/CommonUtilsModal';
import { VinculacionPersonalSubcircuitoService } from 'src/app/services/services-dependencias/vinculacion-personal-subcircuito.service';
import { ArmamentoService } from 'src/app/services/services-mantenimientos/armamento.service';
import { AsignacionArmamentoService } from 'src/app/services/services-mantenimientos/asignacion-armamento.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-asignacion-armamento',
  templateUrl: './modal-asignacion-armamento.component.html',
  styleUrls: ['./modal-asignacion-armamento.component.css']
})
export class ModalAsignacionArmamentoComponent implements OnInit {

  disabledMatSelection: boolean = false;
  isVisibleCheck: boolean = true;

  @ViewChild(MatSelectionList) matList!: MatSelectionList;

  control = new FormControl('');

  /**
  * AsignacionArmamento recibida como entrada para mostrar o actualizar los datos.
  */
  @Input() public asignacionArmamento!: AsignacionArmamento;

  /**
  * Título del modal.
  */
  public titulo: string = 'Asignacion Armamento';

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
  filteredArmamento!: Observable<Armamento[]>;

  // Función para mostrar el nombre en el campo de autocompletado
  displayArmamento(armamentos: Armamento): string {
    return armamentos?.nombre || '';
  }
  public listArmamento!: Armamento[];
  public listPersonal!: VinculacionPersonalSubcircuito[];
  selectedAll: boolean = false;
  selectedItems: string[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<ModalAsignacionArmamentoComponent>,
    private personalPolicialService: VinculacionPersonalSubcircuitoService,
    private armamentoService: ArmamentoService,
    private asignacionArmamentoService: AsignacionArmamentoService
  ) {
    // Inicializa dependencia si es null
  }
  /**
  * Método que se ejecuta al inicializar el componente.
  */
  ngOnInit(): void {

    let listaFinalFiltrada: VinculacionPersonalSubcircuito[] = [];

    this.setupArmamento();

    this.formulario = this.formBuilder.group({
      codigo: [-1],
      dependencia: ['']
    });
    if (!this.asignacionArmamento) {
      this.personalPolicialService.getElemtsform().subscribe(list => {
        this.asignacionArmamentoService.getElemtsform().subscribe(listVinculacion => {
          // Filtra la lista final para excluir elementos que están en listVinculacion
          listaFinalFiltrada = list.filter(item =>
            !listVinculacion?.some(vinculacionItem => vinculacionItem.vinculacionPersonal.personalPolicial.codigo === item.codigo)
          );
          this.listPersonal = listaFinalFiltrada;
        });
      });
    } else {
      this.personalPolicialService.getElemtsform().subscribe(list => {
        //this.listPersonal = list;
        this.listPersonal = list.filter(item => item.personalPolicial.codigo == this.asignacionArmamento.vinculacionPersonal.personalPolicial.codigo);
        this.formulario = this.formBuilder.group({
          codigo: [this.asignacionArmamento?.codigo],
          dependencia: [this.asignacionArmamento.armamento]
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

  createVinculacion(vinculacionPersonal: VinculacionPersonalSubcircuito, armamento: Armamento) {

    const asignacion = new AsignacionArmamento();
    asignacion.codigo = -1;
    asignacion.vinculacionPersonal = vinculacionPersonal;
    asignacion.armamento = armamento;
    asignacion.fechaAsignacion = new Date();
    asignacion.eliminado = 'N';
    return asignacion;
  }

  /**
   * Método que realiza la creación de una nueva empresa.
   */
  public create(): void {
    const armamento = this.formulario.value.dependencia as Armamento;
    let personalSelected: MatListOption[] = this.matList.selectedOptions.selected;
    personalSelected.forEach(item => {
      if (item.value) {
        const vinculacion = this.createVinculacion(item.value, armamento);
        //console.log('vinculacion', vinculacion);
        const sub = this.asignacionArmamentoService.create(vinculacion).subscribe({
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
    Swal.fire('Nuevo Dotacion', `${"Generado Correctamente"}`, 'success');
    this.dialogRef.close(true);

  }

  /**
  * Método que realiza la actualización de la empresa.
  */
  public update(): void {

    const asignacionUpdate = this.asignacionArmamento;
    asignacionUpdate.armamento = this.formulario.value.dependencia;

    const sub = this.asignacionArmamentoService.update(asignacionUpdate)
      .subscribe({
        next: elemento => {
          Swal.fire('Elemento Actualizado', `Elemento ${elemento.vinculacionPersonal.personalPolicial.nombreCompleto} actualizado con exito!`, 'success');
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

  setupArmamento(): void {
    this.armamentoService.getElemtsform().subscribe(list => {

      this.listArmamento = list;
      this.filteredArmamento = of(this.listArmamento).pipe(
        map(value => this.filterArmamento(''))
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
  onInputValueChangedArmamento(event: Event): void {
    const inputText = (event.target as HTMLInputElement)?.value;
    const normalizedInput = inputText ? inputText.trim() : '';
    if (normalizedInput) {
      this.filteredArmamento = of(this.listArmamento).pipe(
        map(listArmamento =>
          listArmamento.filter(obj =>
            CommonUtilsModal.normalizeValue(obj.nombre).includes(CommonUtilsModal.normalizeValue(normalizedInput))
          )
        )
      );
    } else {
      this.filteredArmamento = of(this.listArmamento);
    }
  }

  /**
  * Función que filtra la lista la entidad por nombre, utilizando un valor de búsqueda.
  * @param value Valor de búsqueda.
  * @returns Lista filtrada de la entidad.
  */
  private filterArmamento(value: string): Armamento[] {
    return CommonUtilsModal.filterEntitiesByName(this.listArmamento, 'nombre', value);
  }

  /**
  * Evento que se dispara cuando se selecciona una opción del campo de autocompletado.
  * @param event Evento de selección de autocompletado.
  */
  onOptionSelectedArmamento(event: MatAutocompleteSelectedEvent): void {
    const selectedDepedencia = event.option.value as Armamento;
    this.control.setValue(selectedDepedencia.nombre);

  }
}
