import productosJson from "./productos.json";
import type { Producto } from "../interfaces/Producto";

export function getProductos(): Producto[] {
  const data = localStorage.getItem("productos");
  if (data) return JSON.parse(data);
  return productosJson as Producto[];
}

export function addProducto(nuevo: Producto) {
  const lista = getProductos();
  lista.unshift(nuevo);
  localStorage.setItem("productos", JSON.stringify(lista));
}

export function saveProductos(lista: Producto[]) {
  localStorage.setItem("productos", JSON.stringify(lista));
}