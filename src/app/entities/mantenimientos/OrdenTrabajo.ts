import { PersonalPolicial } from "../personas/PersonalPolicial";
import { Mantenimiento } from "./Mantenimiento";

export enum EstadoOrdenTrabajo{
  GENERADA = 'G',
  FINALIZADA = 'F'
}
export class OrdenTrabajo {

  codigo!: number;
  estado!: EstadoOrdenTrabajo;
  fechaEntrega!: Date;
  personalRetira!: PersonalPolicial;
  kilometrajeMantenimiento!: number;
  observacion!: string;
  mantenimiento!: Mantenimiento;
  eliminado!: string;
}
