import facturasComprasJson from "./facturasCompras.json";
import type { FacturaCompra } from "../interfaces/FacturaCompra";

export function getFacturasCompras(): FacturaCompra[] {
  const data = localStorage.getItem("facturasCompras");
  if (data) return JSON.parse(data);
  return facturasComprasJson as FacturaCompra[];
}

export function addFacturaCompra(nueva: FacturaCompra) {
  const lista = getFacturasCompras();
  lista.unshift(nueva);
  localStorage.setItem("facturasCompras", JSON.stringify(lista));
}

export function saveFacturasCompras(lista: FacturaCompra[]) {
  localStorage.setItem("facturasCompras", JSON.stringify(lista));
}