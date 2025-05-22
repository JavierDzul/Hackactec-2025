import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Factura, Item, Tax, TaxStamp } from './fact'; // Asegúrate que la ruta a 'fact.ts' sea correcta

export const exportFacturaToPDF = (factura: Factura) => {
  const doc = new jsPDF("p", "mm", "a4");

  // Header
  doc.setFillColor(41, 128, 185);
  doc.rect(0, 0, 210, 30, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(`Factura ${factura.serie}-${factura.folio}`, 14, 20);

  // Datos generales
  let y = 38;
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.text("Datos Generales", 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Fecha:", 14, y);
  doc.text(`${new Date(factura.fecha).toLocaleDateString()}`, 50, y);
  y += 8;
  doc.text("Estado:", 14, y);
  doc.text(`${factura.estado}`, 50, y);
  y += 8;
  doc.text("Cliente:", 14, y);
  doc.text(`${factura.receiver.name}`, 50, y);
  y += 8;
  doc.text("RFC:", 14, y);
  doc.text(`${factura.receiver.rfc}`, 50, y);
  y += 8;
  doc.text("Método de Pago:", 14, y);
  doc.text(`${factura.paymentMethod}`, 50, y);
  y += 8;
  doc.text("Condiciones:", 14, y);
  doc.text(`${factura.paymentConditions}`, 50, y);
  y += 8;
  doc.text("Moneda:", 14, y);
  doc.text(`${factura.currency}`, 50, y);
  y += 8;
  doc.text("Lugar de Expedición:", 14, y);
  doc.text(`${factura.expeditionPlace}`, 50, y);

  // Emisor
  y += 12;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Emisor", 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Nombre:", 14, y);
  doc.text(`${factura.issuer.taxName}`, 50, y);
  y += 8;
  doc.text("RFC:", 14, y);
  doc.text(`${factura.issuer.rfc}`, 50, y);
  y += 8;
  doc.text("Régimen Fiscal:", 14, y);
  doc.text(`${factura.issuer.fiscalRegime}`, 50, y);

  // Subtotales y totales
  y += 12;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Totales", 14, y);
  y += 10;
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", 14, y);
  doc.text(`$${factura.subtotal.toFixed(2)}`, 50, y);
  y += 8;
  doc.text("Descuento:", 14, y);
  doc.text(`$${factura.discount.toFixed(2)}`, 50, y);
  y += 8;
  doc.setFont("helvetica", "bold");
  doc.text("Total:", 14, y);
  doc.text(`$${factura.total.toFixed(2)}`, 50, y);
  doc.setFont("helvetica", "normal");

  // Conceptos
  y += 12;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Conceptos", 14, y);
  y += 4;

  autoTable(doc, {
    startY: y,
    head: [[
      "Descripción",
      "Cantidad",
      "Unidad",
      "Unitario",
      "Desc.",
      "Total"
    ]],
    body: factura.items.map((item: Item) => [
      item.description,
      item.quantity,
      item.unit,
      `$${item.unitValue.toFixed(2)}`,
      `$${item.discount.toFixed(2)}`,
      `$${item.total.toFixed(2)}`
    ]),
    styles: { fontSize: 9, cellPadding: 2 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    alternateRowStyles: { fillColor: [240, 248, 255] },
    margin: { left: 14, right: 14 }
  });

  // Impuestos (si existen)
  if (factura.taxes && factura.taxes.length > 0) {
    let yImp = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(41, 128, 185);
    doc.text("Impuestos", 14, yImp);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    factura.taxes.forEach((tax: Tax, idx: number) => {
      doc.text(
        `${tax.name} (${tax.rate}%): $${tax.total.toFixed(2)} (${tax.type === "transferred" ? "TRASLADADO" : tax.type.toUpperCase()})`,
        25,
        yImp + 8 + idx * 8
      );
    });
  }

  // Timbre fiscal (si existe)
  if (factura.taxStamp) {
    let yTimbre = (doc as any).lastAutoTable.finalY + (factura.taxes && factura.taxes.length > 0 ? 32 : 12) + (factura.taxes ? factura.taxes.length * 8 : 0) ;
    // Ajuste dinámico de yTimbre en caso de que no haya impuestos o haya muchos.
    if ((doc as any).lastAutoTable.finalY > 180 && factura.taxes && factura.taxes.length > 0) { // Ejemplo de umbral, ajustar según necesidad
        doc.addPage();
        yTimbre = 20; // Reiniciar y en nueva página
    } else if ((doc as any).lastAutoTable.finalY > 220 ) {
        doc.addPage();
        yTimbre = 20;
    }


    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "bold");
    doc.text("Timbre Fiscal Digital", 14, yTimbre);
    doc.setFont("helvetica", "normal");
    doc.text(
      `UUID: ${factura.taxStamp.uuid}`,
      14,
      yTimbre + 8
    );
    doc.text(
      `Certificado SAT: ${factura.taxStamp.satCertNumber}`,
      14,
      yTimbre + 16
    );
    doc.text(
      `Fecha: ${new Date(factura.taxStamp.date).toLocaleString()}`,
      14,
      yTimbre + 24
    );
  }

  doc.save(`Factura_${factura.serie}-${factura.folio}.pdf`);
};