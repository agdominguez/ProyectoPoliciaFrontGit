import { VinculacionPersonalSubcircuito } from "../dependencias/VinculacionPersonalSubcircuito";
import { VinculacionFlotaSubcircuito } from "../flotas/VinculacionFlotaSubcircuito";

export class Vinculacion {

  codigo!: number;
  vinculacionPersonal!: VinculacionPersonalSubcircuito;
  vinculacionFlota!: VinculacionFlotaSubcircuito;
  eliminado!: string;

}
