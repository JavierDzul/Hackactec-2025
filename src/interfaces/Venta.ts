import type { Concepto } from "./Concepto";
import type { Cliente } from "./Cliente";

export interface Venta {
  id: string; // UUID
  fecha: string;
  cliente: Cliente;
  conceptos: Concepto[];
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: string;
  facturaUuid?: string; // Relación con la factura generada
}