import { Solicitud } from "./Solicitud";

export class Mantenimiento {
  codigo!: number;
  solicitud!: Solicitud;
  asunto!: string;
  detalle!: string;
  fechaIngreso!: Date;
  kilometrajeActual!: number;
  eliminado!: string;

  constructorPK(codigo: number) {
    const mantenimiento = new Mantenimiento();
    mantenimiento.codigo = codigo;
    return mantenimiento;
  }

}
