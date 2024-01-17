import { Solicitud } from "./Solicitud";
import { TipoMantenimiento } from "./TipoMantenimiento";

export class Mantenimiento {
  codigo!: number;
  solicitud!: Solicitud;
  asunto!: string;
  detalle!: string;
  fechaIngreso!: Date;
  tipoMantenimiento!: TipoMantenimiento;
  kilometrajeActual!: number;
  eliminado!: string;
}
