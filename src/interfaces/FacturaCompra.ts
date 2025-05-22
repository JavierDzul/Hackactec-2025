import type { Concepto } from "./Concepto";
import type { Tax } from "./Tax";

export interface FacturaCompra {
  uuid: string;
  serie: string;
  folio: string;
  fecha: string;
  proveedor: {
    rfc: string;
    nombre: string;
    direccion?: string;
  };
  cuentaEmpresa: {
    rfc: string;
    nombre: string;
  };
  conceptos: Concepto[];
  subtotal: number;
  discount: number;
  total: number;
  taxes: Tax[];
  estado: string;
  taxStamp: {
    uuid: string;
    date: string;
    cfdiSign: string;
    satCertNumber: string;
    satSign: string;
    rfcProvCertif: string;
  };
}