import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';

@Component({
  selector: 'app-paginator',
  templateUrl: './paginator.component.html',
  styleUrls: ['./paginator.component.css']
})
export class PaginatorComponent implements OnInit, OnChanges {
   // Propiedades de entrada
   @Output() pageSizeChange = new EventEmitter<number>();
   @Input() paginador: any;
   @Input() nombre!: string;
   @Input() url?: string;

   // Propiedades de paginación
   pageSize: number = 10;
   paginas!: number[];
   desde!: number;
   hasta!: number;
   pageSizeOptions: number[] = [10, 15, 20];

   constructor() { }

   ngOnInit(): void {
     this.initPaginator();
   }

   ngOnChanges(changes: SimpleChanges): void {
     if (changes["paginador"] && this.paginador) {
       this.initPaginator();
       console.log(this.pageSize);
     }
   }
   /**
    * Inicializa la paginación calculando las páginas a mostrar.
    */
   private initPaginator(): void {
     const totalPages = this.paginador.totalPages;
     const currentPage = this.paginador.number + 1;
     const maxPagesToShow = 5;

     if (totalPages <= maxPagesToShow) {
       this.paginas = Array.from({ length: totalPages }, (_, i) => i + 1);
     } else {
       const middlePage = Math.floor(maxPagesToShow / 2);
       let startPage = currentPage - middlePage;
       let endPage = currentPage + middlePage;

       if (currentPage <= middlePage) {
         startPage = 1;
         endPage = maxPagesToShow;
       } else if (currentPage + middlePage >= totalPages) {
         startPage = totalPages - maxPagesToShow + 1;
         endPage = totalPages;
       }

       this.paginas = Array.from({ length: maxPagesToShow }, (_, i) => startPage + i);
     }
   }

   /**
    * Cambia el tamaño de página seleccionado y recalcula la paginación.
    */
   changePageSize(): void {
     this.initPaginator();
     // Emite el valor de pageSize hacia el componente padre
     this.pageSizeChange.emit(this.pageSize);
   }

}
