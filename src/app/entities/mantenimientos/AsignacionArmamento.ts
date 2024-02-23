import { VinculacionPersonalSubcircuito } from "../dependencias/VinculacionPersonalSubcircuito";
import { PersonalPolicial } from "../personas/PersonalPolicial";
import { Armamento } from "./Armamento";

export class AsignacionArmamento {

  codigo!: number;
  vinculacionPersonal!: VinculacionPersonalSubcircuito;
  fechaAsignacion!: Date;
  eliminado!: string;
  armamento!: Armamento;
}
