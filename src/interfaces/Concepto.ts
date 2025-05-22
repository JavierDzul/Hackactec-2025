import type { Tax } from "./Tax";

export interface Concepto {
  id: string; // UUID
  tipo: "producto" | "servicio";
  nombre: string;
  descripcion: string;
  cantidad: number;
  unidad: string; // Ej: "PZA", "SERV"
  precioUnitario: number;
  descuento: number;
  total: number;
  impuestos?: Tax[];
}