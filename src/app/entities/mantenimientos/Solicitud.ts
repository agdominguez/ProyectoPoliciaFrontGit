import { Vinculacion } from "./Vinculacion";

export enum TipoSolicitud {
  INGRESADA = 'I',
  RECHAZADA = 'R',
  APROBADA = 'A',
  MANTENIMIENTO = 'P',
  FINALIZADA = 'F',
}

export class Solicitud {

  codigo!: number;
  vinculacion!: Vinculacion;
  estado!: TipoSolicitud;
  fechaReserva!: Date;
  kilometraje!: number;
  observacion!: string;
  eliminado!: string;
}
