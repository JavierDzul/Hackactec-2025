import type { Issuer } from "./Issuer";
import type { Receiver } from "./Receiver";
import type { Concepto } from "./Concepto";
import type { Tax } from "./Tax";
import type { TaxStamp } from "./TaxStamp";

export interface Factura {
  uuid: string;
  serie: string;
  folio: string;
  fecha: string;
  paymentTerms: string;
  paymentConditions: string;
  paymentMethod: string;
  expeditionPlace: string;
  currency: string;
  subtotal: number;
  discount: number;
  total: number;
  estado: string;
  issuer: Issuer;
  receiver: Receiver;
  conceptos: Concepto[];
  taxes: Tax[];
  taxStamp: TaxStamp;
}