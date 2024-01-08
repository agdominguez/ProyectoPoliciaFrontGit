import { AbstractControl, AsyncValidatorFn, FormGroup, ValidationErrors, ValidatorFn } from "@angular/forms";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";
import { Observable, debounceTime, map, of } from "rxjs";

export class CommonUtilsModal {
  /**
  * Filtra una lista de entidades por un atributo y un valor de búsqueda.
  * @param list La lista de entidades a filtrar.
  * @param attributeName El nombre del atributo de la entidad que contiene el valor a comparar.
  * @param value Valor de búsqueda.
  * @returns Lista filtrada de entidades.
  */
  static filterEntitiesByName<T extends Record<string, any>>(list: T[], attributeName: keyof T, value: string): T[] {
    const filterValue = CommonUtilsModal.normalizeValue(value);
    return list.filter(
      entity => CommonUtilsModal.normalizeValue(entity[attributeName]).includes(filterValue)
    );
  }

  /**
   * Normaliza un valor convirtiéndolo a mayúsculas y eliminando espacios en blanco.
   * @param value Valor a normalizar.
   * @returns Valor normalizado.
   */
  static normalizeValue(value: string): string {
    if (value && typeof value === 'string') {
      return value.toUpperCase().replace(/\s/g, '');
    }
    return '';
  }

  /**
   * Evento genérico que se dispara cuando se selecciona una opción del campo de autocompletado.
   * @param event Evento de selección de autocompletado.
   * @param form El formulario en el que se actualizará el control.
   * @param controlName Nombre del control del formulario.
   */
  static onOptionSelectedGeneric<T>(event: MatAutocompleteSelectedEvent, form: FormGroup, controlName: string): void {
    const selectedValue = event.option.value as T;
    form.get(controlName)?.setValue(selectedValue);
  }

  /**
  * Crea un validador personalizado para verificar si se ha seleccionado una entidad válida en un control de formulario.
  * @param entityName El nombre de la entidad para personalizar el mensaje de error.
  * @returns Una función validadora que retorna un objeto de error si la entidad no es válida, o null si es válida.
   */
  static entityValidator(entityName: string): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedEntity = control.value;
      if (!selectedEntity || !selectedEntity.nombre) {
        const errorKey = `invalid${entityName}`;
        return { [errorKey]: true };
      }
      return null;
    };
  }
  /**
   * Valida número de identificación ecuatoriana (cedula)
   *
   * @param cedula
   * @returns boolean
   */

  static cedulaAsyncValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const cedula = control.value;

      return of(null).pipe(
        debounceTime(300),
        map(() => {
          AbstractControl
          if (!cedula || cedula.length !== 10) {
            return { minLengthID: true };
          }

          let tercerDigito = parseInt(cedula.charAt(2), 10);
          if (tercerDigito < 6) {
            let coefValCedula = [2, 1, 2, 1, 2, 1, 2, 1, 2];
            let verificador = parseInt(cedula.charAt(9), 10);
            let suma = 0;
            for (let i = 0; i < 9; i++) {
              let digito = parseInt(cedula.charAt(i), 10) * coefValCedula[i];
              suma += digito >= 10 ? digito - 9 : digito;
            }
            if ((suma % 10 === 0 && verificador === 0) || (10 - (suma % 10) === verificador)) {
              return null; // La cédula es válida
            }
          }
          return { invalidID: true };
        })
      )
    }
  }

  //Definir el validador personalizado en el componente
  static validatorDDL(campoRequerido: any): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const selectedEntidad = control.value;
      if (!selectedEntidad || !selectedEntidad[campoRequerido]) {
        return { invalidParametro: true };
      }
      return null;
    };
  }
}
