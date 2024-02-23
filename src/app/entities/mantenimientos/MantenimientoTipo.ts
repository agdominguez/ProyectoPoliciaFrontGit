import { Mantenimiento } from "./Mantenimiento";
import { TipoMantenimiento } from "./TipoMantenimiento";

export class MantenimientoTipo {
  codigo!: number;
  mantenimiento!: Mantenimiento;
  tipo!: TipoMantenimiento;
  eliminado!: string;
}
