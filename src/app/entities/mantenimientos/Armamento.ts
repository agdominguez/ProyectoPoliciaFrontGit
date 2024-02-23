import { Dependencia } from "../dependencias/dependencia";

export class Armamento {
  codigo!: number;
  tipoArma!: string;
  nombre!: string;
  descripcion!: string;
  eliminado!: string;
  dependencia!: Dependencia;
  codigoArma!: string;
}
