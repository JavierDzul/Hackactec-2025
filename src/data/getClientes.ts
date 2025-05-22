import clientesJson from "./clientes.json";
import type { Cliente } from "../interfaces/Cliente";

export function getClientes(): Cliente[] {
  const data = localStorage.getItem("clientes");
  if (data) return JSON.parse(data);
  return clientesJson as Cliente[];
}

export function addCliente(nuevo: Cliente) {
  const lista = getClientes();
  lista.unshift(nuevo);
  localStorage.setItem("clientes", JSON.stringify(lista));
}

export function saveClientes(lista: Cliente[]) {
  localStorage.setItem("clientes", JSON.stringify(lista));
}