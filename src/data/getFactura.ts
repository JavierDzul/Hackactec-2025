import facturasJson from "./facturas.json";
import type { Factura } from "../interfaces/Factura";

export function getFacturas(): Factura[] {
  const data = localStorage.getItem("facturas");
  if (data) return JSON.parse(data);
  return facturasJson as Factura[];
}

export function addFactura(nueva: Factura) {
  const lista = getFacturas();
  lista.unshift(nueva);
  localStorage.setItem("facturas", JSON.stringify(lista));
}

export function saveFacturas(lista: Factura[]) {
  localStorage.setItem("facturas", JSON.stringify(lista));
}