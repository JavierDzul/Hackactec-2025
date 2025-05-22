import  { useMemo } from "react";
import { Card, Table } from "react-bootstrap";
import { getFacturas } from "../../data/getFactura";
import { getFacturasCompras } from "../../data/getFacturaCompras";
import type { Factura } from "../../interfaces/Factura";
import type { FacturaCompra } from "../../interfaces/FacturaCompra";

/**
 * Componente que muestra el cálculo fiscal mensual de IVA e ISR,
 * usando los datos reales de facturación y compras.
 */
const ResumenFiscalMensual: React.FC = () => {
  // Obtén las facturas emitidas (ventas) y recibidas (compras)
  const facturas: Factura[] = getFacturas();
  const facturasCompras: FacturaCompra[] = getFacturasCompras();

  // Calcula los totales de ventas y compras del mes actual
  const now = new Date();
  const mesActual = now.getMonth();
  const anioActual = now.getFullYear();

  // Filtra facturas del mes actual
  const ventasMes = useMemo(
    () =>
      facturas.filter((f) => {
        const fecha = new Date(f.fecha);
        return (
          fecha.getMonth() === mesActual &&
          fecha.getFullYear() === anioActual &&
          f.estado === "Activo"
        );
      }),
    [facturas, mesActual, anioActual]
  );

  const comprasMes = useMemo(
    () =>
      facturasCompras.filter((f) => {
        const fecha = new Date(f.fecha);
        return (
          fecha.getMonth() === mesActual &&
          fecha.getFullYear() === anioActual &&
          f.estado === "Activo"
        );
      }),
    [facturasCompras, mesActual, anioActual]
  );

  // Ventas
  const ventasSinIVA = ventasMes.reduce((sum, f) => sum + f.subtotal, 0);
  const ivaVentas = ventasMes
    .flatMap((f) => f.taxes)
    .filter((tax) => tax.name === "IVA" && tax.type === "transferred")
    .reduce((sum, tax) => sum + tax.total, 0);

  // Compras (deducibles)
  const comprasSinIVA = comprasMes.reduce((sum, f) => sum + f.subtotal, 0);
  const ivaCompras = comprasMes
    .flatMap((f) => f.taxes)
    .filter((tax) => tax.name === "IVA" && tax.type === "transferred")
    .reduce((sum, tax) => sum + tax.total, 0);

  // Deducibles: suma de compras y servicios contratados (puedes agregar más lógica si tienes servicios independientes)
  const deducibles = comprasSinIVA;

  // IVA acreditable (solo compras normales aquí, puedes agregar lógica para independientes si los tienes)
  const ivaAcreditable = ivaCompras;

  // IVA neto a pagar
  const ivaNeto = ivaVentas - ivaAcreditable;

  // Utilidad fiscal
  const utilidadFiscal = ventasSinIVA - deducibles;
  const isrPropio = utilidadFiscal > 0 ? utilidadFiscal * 0.3 : 0; // Ejemplo: tasa 30%

  return (
    <Card className="my-4">
      <Card.Header>
        <h4>Resumen Fiscal Mensual</h4>
      </Card.Header>
      <Card.Body>
        <Table bordered>
          <thead>
            <tr>
              <th>Concepto</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>IVA trasladado (ventas)</td>
              <td>${ivaVentas.toFixed(2)}</td>
            </tr>
            <tr>
              <td>IVA acreditable (compras deducibles)</td>
              <td>${ivaAcreditable.toFixed(2)}</td>
            </tr>
            <tr>
              <td>IVA neto a pagar</td>
              <td>${ivaNeto.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Deducibles (compras y gastos facturados)</td>
              <td>${deducibles.toFixed(2)}</td>
            </tr>
            <tr>
              <td>ISR propio (aprox. 30% utilidad fiscal)</td>
              <td>${isrPropio.toFixed(2)}</td>
            </tr>
            <tr>
              <th>Total a pagar al SAT (sin retenciones)</th>
              <th>${(ivaNeto + isrPropio).toFixed(2)}</th>
            </tr>
          </tbody>
        </Table>
        <div>
          <strong>Utilidad fiscal del mes:</strong>{" "}
          {utilidadFiscal < 0
            ? `Pérdida fiscal de $${Math.abs(utilidadFiscal).toFixed(2)}`
            : `$${utilidadFiscal.toFixed(2)}`}
        </div>
      </Card.Body>
    </Card>
  );
};

export default ResumenFiscalMensual;