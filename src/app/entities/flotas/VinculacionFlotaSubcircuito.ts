import { Dependencia } from "../dependencias/dependencia";
import { FlotaVehicular } from "./FlotaVehicular";

export class VinculacionFlotaSubcircuito {

  codigo!: number;
  flotaVehicular!: FlotaVehicular;
  dependencia!: Dependencia;
  eliminado!: string;
}
