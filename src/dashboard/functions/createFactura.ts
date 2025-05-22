import type { Factura, Issuer, Receiver, Item, Tax, TaxStamp } from "../pages/Facturacion";

/**
 * Crea una factura válida con todos los atributos requeridos y cálculos automáticos.
 */
export function createFactura(params: {
  serie: string;
  folio: string;
  fecha: string;
  paymentTerms: string;
  paymentConditions: string;
  paymentMethod: string;
  expeditionPlace: string;
  currency: string;
  estado: string;
  issuer: Issuer;
  receiver: Receiver;
  items: Item[];
  taxes: Tax[];
  discount?: number;
  taxStamp?: Partial<TaxStamp>;
}): Factura {
  // Calcular subtotal como suma de los totales de los items
  const subtotal = params.items.reduce((sum, item) => sum + (item.total || 0), 0);
  const discount = params.discount ?? 0;

  // Calcular total de impuestos
  const taxesTotal = params.taxes.reduce((sum, tax) => sum + (tax.total || 0), 0);

  // Calcular total final
  const total = subtotal - discount + taxesTotal;

  // UUID para factura y timbre fiscal
  const uuid =
    params.taxStamp?.uuid ||
    (typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2));

  return {
    uuid,
    serie: params.serie,
    folio: params.folio,
    fecha: params.fecha,
    paymentTerms: params.paymentTerms,
    paymentConditions: params.paymentConditions,
    paymentMethod: params.paymentMethod,
    expeditionPlace: params.expeditionPlace,
    currency: params.currency,
    subtotal,
    discount,
    total,
    estado: params.estado,
    issuer: params.issuer,
    receiver: params.receiver,
    items: params.items,
    taxes: params.taxes,
    taxStamp: {
      uuid,
      date: params.taxStamp?.date || new Date().toISOString(),
      cfdiSign: params.taxStamp?.cfdiSign || "",
      satCertNumber: params.taxStamp?.satCertNumber || "",
      satSign: params.taxStamp?.satSign || "",
      rfcProvCertif: params.taxStamp?.rfcProvCertif || ""
    }
  };
}