import type { Concepto } from "./Concepto";

export interface Producto extends Concepto {
  tipo: "producto";
  proveedor: string;
  precioCompra: number;
  precioVenta: number;
  img?: string | ArrayBuffer | null;
}