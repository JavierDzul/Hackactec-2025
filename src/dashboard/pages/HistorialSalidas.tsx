import { Container, Table, Button, Row, Col, Form, Modal } from 'react-bootstrap';
import { useState } from 'react';
import FacturaModal from '../utils/FacturaModal';
import { FacturaModalInternal, type Factura } from './fact';
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';

interface Salida {
  id: number;
  nombre: string;
  cantidad: number;
  tipo: string;
  costo: number;
  facturado: boolean;
  factura: Factura | null
}

const salidasIniciales: Salida[] = [
  { id: 1, nombre: 'Jabón', cantidad: 5, tipo: 'Venta', costo: 50, facturado: true , factura: null },
  { id: 2, nombre: 'Shampoo', cantidad: 2, tipo: 'Donación', costo: 0, facturado: false, factura: null },
  { id: 3, nombre: 'Jabón', cantidad: 7, tipo: 'Venta', costo: 100, facturado: false, factura: null }
];


export const HistorialSalidasPage = () => {
    
  const [salidas, setSalidas] = useState<Salida[]>(salidasIniciales);
  const [mostrarModal, setMostrarModal] = useState(false);
    const [salidaSeleccionada, setSalidaSeleccionada] = useState<Salida | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"PDF" | "XML" | "VIEW" | "NEW" | "">("");
  const [invoices, setInvoices] = useState<Factura[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Factura | null>(null);
   const [facturaModalType, setFacturaModalType] = useState<"PDF" | "XML" | "VIEW" | "NEW" | "">("");
    const [showFacturaExtras, setShowFacturaExtras] = useState<boolean>(false);

    const handleEditar = (salida: Salida) => {
  setSalidaSeleccionada(salida);
  setMostrarModal(true);
};

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

const openNewFacturaModal = (s: Salida) => {
    setSalidaSeleccionada(s)
    setModalType("NEW");
    setShowModal(true);
  };

  const handleSaveFacturaFromModal = (factura: Factura) => {
      setInvoices([factura, ...invoices]);
      setSalidas((prev) =>
          prev.map((s) => (s.id === salidaSeleccionada!.id ? {...salidaSeleccionada!, facturado: true, factura: factura } : s))
        );
        setSalidaSeleccionada(null)
    };


  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h3>Historial de salidas</h3>
        </Col>
      </Row>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Tipo de salida</th>
            <th>Costo asociado</th>
            <th>Factura</th>
            <th>Acciones</th>
            
          </tr>
        </thead>
        <tbody>
          {salidas.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.nombre}</td>
              <td>{s.cantidad}</td>
              <td>{s.tipo}</td>
              <td>${s.costo.toFixed(2)}</td>
              <td>
                {s.tipo === 'Venta' && (
                    s.facturado ? (
                    <Button size="sm" variant="success" onClick={() => exportFacturaToPDF(s.factura!)}>
                        Ver factura
                    </Button>
                    ) : (
                    <Button size="sm" variant="outline-primary" onClick={() => openNewFacturaModal(s)}>
                        Generar factura
                    </Button>
                    )
                )}
                </td>


              <td>
                <Button size="sm" variant="warning" onClick={() => handleEditar(s)}>
                Editar
                </Button>

              </td>
            </tr>
          ))}
        </tbody>
      </Table>

        <Modal show={mostrarModal} onHide={() => setMostrarModal(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Editar salida</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {salidaSeleccionada && (
      <Form>
        <Form.Group className="mb-3">
          <Form.Label>Producto</Form.Label>
          <Form.Control
            type="text"
            value={salidaSeleccionada.nombre}
            onChange={(e) =>
              setSalidaSeleccionada({ ...salidaSeleccionada, nombre: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Cantidad</Form.Label>
          <Form.Control
            type="number"
            value={salidaSeleccionada.cantidad}
            onChange={(e) =>
              setSalidaSeleccionada({ ...salidaSeleccionada, cantidad: Number(e.target.value) })
            }
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Tipo de salida</Form.Label>
          <Form.Control
            type="text"
            value={salidaSeleccionada.tipo}
            onChange={(e) =>
              setSalidaSeleccionada({ ...salidaSeleccionada, tipo: e.target.value })
            }
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Costo asociado</Form.Label>
          <Form.Control
            type="number"
            value={salidaSeleccionada.costo}
            onChange={(e) =>
              setSalidaSeleccionada({ ...salidaSeleccionada, costo: Number(e.target.value) })
            }
          />
        </Form.Group>
      </Form>
    )}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setMostrarModal(false)}>
      Cancelar
    </Button>
    <Button
      variant="primary"
      onClick={() => {
        setSalidas((prev) =>
          prev.map((s) => (s.id === salidaSeleccionada!.id ? salidaSeleccionada! : s))
        );
        setMostrarModal(false);
      }}
    >
      Guardar cambios
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
