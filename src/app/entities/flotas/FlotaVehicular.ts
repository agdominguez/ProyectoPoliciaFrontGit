import { TipoVehiculo } from "./TipoVehiculo";

export class FlotaVehicular {
  codigo!: number;
  placa!: string;
  chasis!: string;
  marca!: string;
  modelo!: string;
  motor!: string;
  kilometraje!: number;
  cilindraje!: number;
  capacidadCarga!: number;
  capacidadPasajeros!: number;
  fechaIngreso!: Date;
  eliminado!: string;
  tipoVehiculo!: TipoVehiculo;
}
