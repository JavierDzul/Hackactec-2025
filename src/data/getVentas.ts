import ventasJson from "./ventas.json";
import type { Venta } from "../interfaces/Venta";

export function getVentas(): Venta[] {
  const data = localStorage.getItem("ventas");
  if (data) return JSON.parse(data);
  return ventasJson as Venta[];
}

export function addVenta(nueva: Venta) {
  const lista = getVentas();
  lista.unshift(nueva);
  localStorage.setItem("ventas", JSON.stringify(lista));
}

export function saveVentas(lista: Venta[]) {
  localStorage.setItem("ventas", JSON.stringify(lista));
}