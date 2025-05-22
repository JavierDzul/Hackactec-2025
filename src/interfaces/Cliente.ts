export interface Cliente {
  id: string; // UUID
  nombre: string;
  rfc: string;
  direccion?: string;
  email?: string;
  telefono?: string;
}