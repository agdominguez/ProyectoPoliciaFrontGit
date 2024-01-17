import { Dependencia } from "../dependencias/dependencia";
import { TipoReclamo } from "./TipoReclamo";

export class Sugerencia {

  codigo!: number;
  dependencia!: Dependencia;
  detalle!: string;
  contacto!: string;
  apellidos!: string;
  nombres!: string;
  eliminado!: string;
  tipoReclamo!: TipoReclamo;
  fecha!: Date;
}
