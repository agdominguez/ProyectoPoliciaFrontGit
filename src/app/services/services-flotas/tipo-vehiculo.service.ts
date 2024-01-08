import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, tap } from 'rxjs';
import Swal from 'sweetalert2';
import { TipoVehiculo } from '../../entities/flotas/TipoVehiculo';

@Injectable({
  providedIn: 'root'
})
export class TipoVehiculoService {

  private urlEndPoint: string = 'http://localhost:8080/tipoVehiculo'
  private httpHeaders = new HttpHeaders({ 'content-Type': 'application/json' })

  constructor(
    private http: HttpClient
  ) { }

  // *****************************************************
  // Realizado por: Alex Dominguez
  // Fecha: 02/08/2023
  // Metodo handleError utilizado para tener un control
  // de errores al solicitar recursos al backend
  // *****************************************************
  private handleError(error: HttpErrorResponse): never {
    let errorMessage = 'Ha ocurrido un error en el servidor';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // El servidor devolvió un código de error
      if (error.status === 400) {
        errorMessage = error.error.mensaje || 'Solicitud incorrecta';
      } else if (error.status === 404) {
        errorMessage = error.error.mensaje || 'Recurso no encontrado';
      } else if (error.status === 500) {
        errorMessage = error.error.mensaje || 'Error interno del servidor';
      }
    }

    Swal.fire('Error', errorMessage, 'error');
    throw errorMessage;
  }

  // *****************************************************
  // Realizado por: Alex Dominguez
  // Fecha: 02/08/2023
  // Metodo utilizado para listar todos los elementos
  // que contenga una lista a travez de paginadores
  // *****************************************************
  getListGlobal(pageSize: number, page: number): Observable<any> {
    const url = `${this.urlEndPoint}/page/${pageSize}/${page}`;
    return this.http.get<any>(url).pipe(
      catchError(error => this.handleError(error)),
      tap((response: any) => {
        (response.content as TipoVehiculo[]).forEach(tipoVehiculo => {
        });
      })
    );
  }

  // *****************************************************
  // Realizado por: Alex Dominguez
  // Fecha: 02/08/2023
  // Metodo utilizado para listar los elementos que
  // contengan el campo eliminado con estado N y mostrar
  // los mismos a travez de paginadores
  // *****************************************************

  getNotDelete(pageSize: number, page: number): Observable<any> {
    const url = `${this.urlEndPoint}/notDeleted/page/${pageSize}/${page}`;
    return this.http.get<any>(url).pipe(
      catchError(error => this.handleError(error)),
      tap((response: any) => {
        (response.content as TipoVehiculo[]).forEach(tipoVehiculo => {
        });
      })
    );
  }

  // *****************************************************
  // Realizado por: Alex Dominguez
  // Fecha: 02/08/2023
  // Metodo utilizado para cargar la informacion de un item
  // de la lista de elementos en el formulario para editar.
  // *****************************************************

  getElement(): Observable<TipoVehiculo[]> {
    return this.http.get<TipoVehiculo[]>(this.urlEndPoint).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // *****************************************************
  // Realizado por: Alex Dominguez
  // Fecha: 02/08/2023
  // Metodo utilizado para crear un elemento nuevo en la
  // base de datos.
  // *****************************************************

  create(tipoVehiculo: TipoVehiculo): Observable<any> {
    console.log(this.urlEndPoint, tipoVehiculo);
    return this.http.post<any>(this.urlEndPoint, tipoVehiculo, { headers: this.httpHeaders }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // *****************************************************
  // Realizado por: Alex Dominguez
  // Fecha: 02/08/2023
  // Metodo utilizado para actualizar un elemento nuevo en
  // la base de datos.
  // *****************************************************

  update(tipoVehiculo: TipoVehiculo): Observable<TipoVehiculo> {
    return this.http.put<any>(`${this.urlEndPoint}/${tipoVehiculo.codigo}`, tipoVehiculo, { headers: this.httpHeaders }).pipe(
      catchError(error => this.handleError(error)),
      map((response: any) => response.elemento as TipoVehiculo)
    );
  }

  // *****************************************************
  // Realizado por: Alex Dominguez
  // Fecha: 02/08/2023
  // Metodo utilizado para eliminar de forma permanente
  // un elmento de base de datos.
  // *****************************************************

  delete(id: any): Observable<TipoVehiculo> {
    return this.http.delete<TipoVehiculo>(`${this.urlEndPoint}/${id}`, { headers: this.httpHeaders }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // *****************************************************
  // Realizado por: Alex Dominguez
  // Fecha: 02/08/2023
  // Metodo utilizado para buscar elementos de manera
  // personalizada filtrando informacion a travez de sus
  // diferentes campos.
  // *****************************************************

  searchList(search: string, page: number, pageSize: number): Observable<any> {
    const params = { search: search || '', page: String(page), pageSize: String(pageSize) };
    return this.http.get<any>(`${this.urlEndPoint}/buscar`, { params }).pipe(
      catchError(error => this.handleError(error)),
      tap((response: any) => {
        (response.content as TipoVehiculo[]).forEach(tipoVehiculo => {
        });
      })
    );
  }

  // *****************************************************
  // Realizado por: Alex Dominguez
  // Fecha: 02/08/2023
  // Metodo utilizado para cambiar el estado de campo
  // Eliminado a S el mismo que desaparecera de las lista
  // principal ya que el mismo filtra campos por el estado
  // Eliminado en estado N.
  // *****************************************************

  statusEliminado(id: number): Observable<any> {
    const url = `${this.urlEndPoint}/${id}/eliminar`;
    return this.http.put<any>(url, {}).pipe(
      catchError(error => this.handleError(error))
    );
  }
  /**
   * Método utilizado para obtener la lista completa de entidades para su uso en formularios.
   */
  getElemtsform(): Observable<TipoVehiculo[]> {
    return this.http.get<TipoVehiculo[]>(this.urlEndPoint + '/list').pipe(
      catchError(error => this.handleError(error))
    );
  }
  /**
   * Método utilizado para obtener la lista de entidades que no han sido eliminadas mediante paginación y agrega un ordenamiento.
   */
  getNotDeletedOrdered(pageSize: number, page: number, sortColumn: string, sortDirection: string): Observable<any> {
    const url = `${this.urlEndPoint}/notDeleted/ordered/page/${pageSize}/${page}`;
    const params = {
      sortColumn: sortColumn || 'codigo', // Si no se proporciona la columna de ordenamiento, se usa 'nombre' como predeterminado
      sortDirection: sortDirection || 'asc' // Si no se proporciona la dirección de ordenamiento, se usa 'asc' como predeterminado
    };

    return this.http.get<any>(url, { params }).pipe(
      catchError(error => this.handleError(error)),
      tap((response: any) => {
        (response.content as TipoVehiculo[]).forEach(apertura => {
          // Se puede realizar alguna operación con cada elemento de la lista si es necesario
        });
      })
    );
  }
}
