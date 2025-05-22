import type { Concepto } from "./concepto";

export interface Servicio extends Concepto {
  tipo: "servicio";
  responsable?: string;
}