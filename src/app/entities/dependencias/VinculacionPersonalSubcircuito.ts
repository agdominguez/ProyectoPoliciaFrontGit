import { PersonalPolicial } from "../personas/PersonalPolicial";
import { Dependencia } from "./dependencia";

export class VinculacionPersonalSubcircuito {
  codigo!: number;
  personalPolicial!: PersonalPolicial;
  dependencia!: Dependencia;
  eliminado!: string;
}
