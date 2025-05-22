import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form
} from 'react-bootstrap';
import { FacturaModalInternal, type Factura } from './fact';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

export const VentaDetallePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const productos = location.state?.productos || [];

  const [metodoPago, setMetodoPago] = useState('');
  const [ventaConfirmada, setVentaConfirmada] = useState(false);
  const [mostrarConfirmModal, setMostrarConfirmModal] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [facturaModalType, setFacturaModalType] = useState<"PDF" | "XML" | "VIEW" | "NEW" | "">("");
  const [selectedInvoice, setSelectedInvoice] = useState<Factura | null>(null);
  const [showFacturaExtras, setShowFacturaExtras] = useState<boolean>(false);
  const [invoices, setInvoices] = useState<Factura>();

  const total = productos.reduce(
    (acc: number, p: any) => acc + p.precioVenta * p.cantidadVendida,
    0
  );

  const exportFacturaToPDF = (factura: Factura) => {
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
        body: factura.items.map((item) => [
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
        factura.taxes.forEach((tax, idx) => {
          doc.text(
            `${tax.name} (${tax.rate}%): $${tax.total.toFixed(2)} (${tax.type === "transferred" ? "TRASLADADO" : tax.type.toUpperCase()})`,
            25,
            yImp + 8 + idx * 8
          );
        });
      }
  
      // Timbre fiscal (si existe)
      if (factura.taxStamp) {
        let yTimbre = (doc as any).lastAutoTable.finalY + 32;
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

  const closeFacturaModalHandler = () => {
    setShowModal(false); setSelectedInvoice(null); setFacturaModalType(""); setShowFacturaExtras(false);
  };

  const openNewFacturaModal = () => {
    setShowModal(true);
  };

  const handleSaveFacturaFromModal = (factura: Factura) => {
      setInvoices(factura);
      exportFacturaToPDF(factura)
    };


  const confirmarVenta = () => {
    setVentaConfirmada(true);
    setMostrarConfirmModal(false);
  };

  return (
    <Container fluid className="d-flex flex-column" style={{ height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <Row className="flex-grow-1 overflow-auto p-4">
        <Col>
          <h4 className="mb-4">Detalle de venta</h4>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Cantidad</th>
                <th>Precio Venta</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p: any) => (
                <tr key={p.id}>
                  <td>
                    {p.img && (
                      <img
                        src={p.img.toString()}
                        alt={p.nombre}
                        width="60"
                        height="60"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </td>
                  <td>{p.nombre}</td>
                  <td>{p.cantidadVendida}</td>
                  <td>${p.precioVenta.toFixed(2)}</td>
                  <td>${(p.precioVenta * p.cantidadVendida).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          <div className="text-end mt-3">
            <h5>Total: ${total.toFixed(2)}</h5>
          </div>
        </Col>
      </Row>

      {/* Barra inferior */}
      <Row className="bg-light py-3 px-4 border-top justify-content-between align-items-center">
        <Col xs="auto">
          <Button variant="danger" size="lg" onClick={() => navigate('/ventas')}>
            Cancelar venta
          </Button>
        </Col>

        <Col xs="auto" className="d-flex gap-3 align-items-center">
          <Form.Select
            value={metodoPago}
            onChange={e => setMetodoPago(e.target.value)}
            style={{ minWidth: '180px' }}
          >
            <option value="">Seleccionar método</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Credito">Crédito</option>
          </Form.Select>

          <Button variant="info" disabled={!ventaConfirmada}>
            Generar nota
          </Button>

          <Button variant="info" disabled={!ventaConfirmada} onClick={() => openNewFacturaModal()}  >
            Generar factura
          </Button>

          <Button
            variant="success"
            onClick={() => setMostrarConfirmModal(true)}
            disabled={productos.length === 0 || !metodoPago}
          >
            Confirmar venta
          </Button>
        </Col>
      </Row>

      {/* Modal de confirmación */}
      <Modal show={mostrarConfirmModal} onHide={() => setMostrarConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas confirmar esta venta?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={confirmarVenta}>
            Confirmar
          </Button>
        </Modal.Footer>
      </Modal>

<FacturaModalInternal
                  show={showModal}
                  onClose={closeFacturaModalHandler}
                  onSave={handleSaveFacturaFromModal}
                   initialFactura={selectedInvoice || undefined} // selectedInvoice sería null para "NEW"
                />

    </Container>
  );
};
