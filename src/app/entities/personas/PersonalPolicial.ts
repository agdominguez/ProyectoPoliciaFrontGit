import { Dependencia } from "../dependencias/dependencia";
import { RangoPolicial } from "./RangoPolicial";
import { TipoSangre } from "./TipoSangre";

export class PersonalPolicial {

  codigo!: number;
  identificacion!: string;
  nombreCompleto!: string;
  fechaNacimiento!: Date;
  tipoSangre!: TipoSangre;
  ciudadNacimiento!: Dependencia;
  telefonoCelular!: string;
  fechaIngreso!: Date;
  eliminado!: string;
  rango!: RangoPolicial;
}
