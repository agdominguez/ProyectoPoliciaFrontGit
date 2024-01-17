import { TipoContrato } from "./TipoContrato";

export class TipoMantenimiento {
  codigo!: number;
  nombre!: string;
  descripcion!: string;
  tipoContrato!: TipoContrato;
  costo!: number;
  eliminado!: string;
}
