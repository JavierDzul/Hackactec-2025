import serviciosJson from "./servicios.json";
import type { Servicio } from "../interfaces/Servicio";

export function getServicios(): Servicio[] {
  const data = localStorage.getItem("servicios");
  if (data) return JSON.parse(data);
  return serviciosJson as Servicio[];
}

export function addServicio(nuevo: Servicio) {
  const lista = getServicios();
  lista.unshift(nuevo);
  localStorage.setItem("servicios", JSON.stringify(lista));
}

export function saveServicios(lista: Servicio[]) {
  localStorage.setItem("servicios", JSON.stringify(lista));
}