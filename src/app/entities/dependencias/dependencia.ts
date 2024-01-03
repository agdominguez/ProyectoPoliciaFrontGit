import { JerarquiaDependencia } from "./jerarquiaDependencia";

export class Dependencia {

  codigo!: number;
  nombre!: string;
  siglas!: string;
  codigoCircuitoSubcircuito!: string;
  eliminado!: string;
  dependenciaPadre!: Dependencia;
  jerarquia!: JerarquiaDependencia;

}
