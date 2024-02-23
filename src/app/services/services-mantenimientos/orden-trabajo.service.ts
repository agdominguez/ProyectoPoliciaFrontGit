import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, tap } from 'rxjs';
import { OrdenTrabajo } from 'src/app/entities/mantenimientos/OrdenTrabajo';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class OrdenTrabajoService {

  private urlEndPoint: string = 'http://localhost:8080/ordenTrabajo'
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
        errorMessage = error.error.mensaje || 'OrdenTrabajo incorrecta';
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
        (response.content as OrdenTrabajo[]).forEach(ordenTrabajo => {
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
        (response.content as OrdenTrabajo[]).forEach(ordenTrabajo => {
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

  getElement(): Observable<OrdenTrabajo[]> {
    return this.http.get<OrdenTrabajo[]>(this.urlEndPoint).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // *****************************************************
  // Realizado por: Alex Dominguez
  // Fecha: 02/08/2023
  // Metodo utilizado para crear un elemento nuevo en la
  // base de datos.
  // *****************************************************

  create(ordenTrabajo: OrdenTrabajo): Observable<any> {
    console.log(this.urlEndPoint, ordenTrabajo);
    return this.http.post<any>(this.urlEndPoint, ordenTrabajo, { headers: this.httpHeaders }).pipe(
      catchError(error => this.handleError(error))
    );
  }

  // *****************************************************
  // Realizado por: Alex Dominguez
  // Fecha: 02/08/2023
  // Metodo utilizado para actualizar un elemento nuevo en
  // la base de datos.
  // *****************************************************

  update(ordenTrabajo: OrdenTrabajo): Observable<OrdenTrabajo> {
    console.log(ordenTrabajo);
    return this.http.put<any>(`${this.urlEndPoint}/${ordenTrabajo.codigo}`, ordenTrabajo, { headers: this.httpHeaders }).pipe(
      catchError(error => this.handleError(error)),
      map((response: any) => response.elemento as OrdenTrabajo)
    );
  }

  // *****************************************************
  // Realizado por: Alex Dominguez
  // Fecha: 02/08/2023
  // Metodo utilizado para eliminar de forma permanente
  // un elmento de base de datos.
  // *****************************************************

  delete(id: any): Observable<OrdenTrabajo> {
    return this.http.delete<OrdenTrabajo>(`${this.urlEndPoint}/${id}`, { headers: this.httpHeaders }).pipe(
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
        (response.content as OrdenTrabajo[]).forEach(ordenTrabajo => {
        });
      })
    );
  }

  actualizaEstadoOrdenTrabajo(ordenTrabajo: OrdenTrabajo): Observable<any> {
    //console.log(this.urlEndPoint, ordenTrabajo);
    return this.http.post<any>(this.urlEndPoint + '/p_actualiza_estado_orden', ordenTrabajo, { headers: this.httpHeaders }).pipe(
      catchError(error => this.handleError(error))
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
  getElemtsform(): Observable<OrdenTrabajo[]> {
    return this.http.get<OrdenTrabajo[]>(this.urlEndPoint + '/list').pipe(
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
        (response.content as OrdenTrabajo[]).forEach(ordenTrabajo => {
          // Se puede realizar alguna operación con cada elemento de la lista si es necesario
        });
      })
    );
  }
}
