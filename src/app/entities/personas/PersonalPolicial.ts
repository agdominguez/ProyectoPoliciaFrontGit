import { RangoPolicial } from "./RangoPolicial";

export class PersonalPolicial {

  codigo!: number;
  identificacion!: string;
  nombreCompleto!: string;
  fechaNacimiento!: Date;
  tipoSangre!: string;
  ciudadNacimiento!: string;
  telefonoCelular!: string;
  fechaIngreso!: Date;
  eliminado!: string;
  rango!: RangoPolicial;
}
