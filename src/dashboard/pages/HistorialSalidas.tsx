import React, { useState, useCallback, useEffect } from 'react';
import { Container, Table, Button, Row, Col, Form, Modal, Card, Badge, Stack } from 'react-bootstrap';
import { FacturaModalInternal, type Factura, type Item as FacturaItem, type Tax as FacturaTax, type TaxStamp as FacturaTaxStamp, type Issuer as FacturaIssuer, type Receiver as FacturaReceiver } from './fact'; // Asegúrate que la ruta y tipos sean correctos
import autoTable from 'jspdf-autotable';
import jsPDF from 'jspdf';
import { FaFileInvoiceDollar, FaPencilAlt, FaEye, FaPlus, FaSave, FaTimes, FaHistory, FaBoxOpen } from 'react-icons/fa';

// Interfaz para Salida
export interface Salida {
  id: number;
  fecha: string; // Añadido para un historial más completo
  nombreProducto: string; // Más específico que 'nombre'
  cantidad: number;
  tipo: 'Venta' | 'Donación' | 'Ajuste' | 'Devolución'; // Tipos más definidos
  costoTotal: number; // Costo total de la salida
  facturado: boolean;
  factura: Factura | null;
  cliente?: string; // Opcional, relevante para ventas
}

// Datos iniciales con la nueva estructura
const salidasIniciales: Salida[] = [
  { id: 1, fecha: '2025-05-20', nombreProducto: 'Jabón de tocador Floral', cantidad: 5, tipo: 'Venta', costoTotal: 50, facturado: true, factura: null, cliente: 'Ana Pérez' },
  { id: 2, fecha: '2025-05-21', nombreProducto: 'Shampoo Anticaspa Pro', cantidad: 2, tipo: 'Donación', costoTotal: 0, facturado: false, factura: null },
  { id: 3, fecha: '2025-05-22', nombreProducto: 'Crema Hidratante Corporal', cantidad: 7, tipo: 'Venta', costoTotal: 100, facturado: false, factura: null, cliente: 'Carlos López' },
];

// Función para generar PDF (se mantiene igual pero podría moverse a utils)
const exportFacturaToPDF = (factura: Factura) => {
    const doc = new jsPDF("p", "mm", "a4");
    // ... (resto del código de exportFacturaToPDF sin cambios) ...
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
      body: factura.items.map((item: FacturaItem) => [ // Asegúrate que FacturaItem esté definido
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
      factura.taxes.forEach((tax: FacturaTax, idx: number) => { // Asegúrate que FacturaTax esté definido
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
       // Ajuste dinámico de yTimbre en caso de que no haya impuestos o haya muchos.
      if ((doc as any).lastAutoTable.finalY > 180 && factura.taxes && factura.taxes.length > 0) { 
          doc.addPage();
          yTimbre = 20; 
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


export const HistorialSalidasPage = () => {
  const [salidas, setSalidas] = useState<Salida[]>(salidasIniciales);
  const [showEditModal, setShowEditModal] = useState(false);
  const [salidaParaEditar, setSalidaParaEditar] = useState<Salida | null>(null);
  
  const [showFacturaModal, setShowFacturaModal] = useState<boolean>(false);
  // `salidaParaFacturar` contendrá la salida para la cual se está generando/viendo una factura.
  const [salidaParaFacturar, setSalidaParaFacturar] = useState<Salida | null>(null);
  // `facturaActualParaModal` será la factura existente (si la hay) o null para una nueva.
  const [facturaActualParaModal, setFacturaActualParaModal] = useState<Factura | null>(null);

  // Cargar datos de localStorage al montar (opcional, buena práctica)
  useEffect(() => {
    const datosGuardados = localStorage.getItem('historialSalidas');
    if (datosGuardados) {
      try {
        const salidasParseadas: Salida[] = JSON.parse(datosGuardados);
        // Aquí podrías querer validar la estructura de salidasParseadas
        setSalidas(salidasParseadas);
      } catch (e) {
        console.error("Error al cargar salidas de localStorage", e);
        setSalidas(salidasIniciales); // Fallback a datos iniciales
      }
    }
  }, []);

  // Guardar datos en localStorage cuando 'salidas' cambia
  useEffect(() => {
    localStorage.setItem('historialSalidas', JSON.stringify(salidas));
  }, [salidas]);


  const handleOpenEditModal = useCallback((salida: Salida) => {
    setSalidaParaEditar({ ...salida }); // Clonar para evitar mutación directa del estado
    setShowEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setShowEditModal(false);
    setSalidaParaEditar(null);
  }, []);

  const handleSaveChangesSalida = useCallback(() => {
    if (salidaParaEditar) {
      setSalidas(prevSalidas =>
        prevSalidas.map(s => (s.id === salidaParaEditar.id ? salidaParaEditar : s))
      );
      handleCloseEditModal();
    }
  }, [salidaParaEditar, handleCloseEditModal]);

  const handleOpenFacturaModal = useCallback((salida: Salida, esNueva: boolean) => {
    setSalidaParaFacturar(salida);
    if (esNueva) {
      setFacturaActualParaModal(null); // Para generar una nueva factura
    } else {
      setFacturaActualParaModal(salida.factura); // Para ver/editar una factura existente
    }
    setShowFacturaModal(true);
  }, []);
  
  const handleCloseFacturaModal = useCallback(() => {
    setShowFacturaModal(false);
    setSalidaParaFacturar(null);
    setFacturaActualParaModal(null);
  }, []);

  const handleSaveFacturaFromModal = useCallback((facturaGuardada: Factura) => {
    if (salidaParaFacturar) {
      setSalidas(prevSalidas =>
        prevSalidas.map(s =>
          s.id === salidaParaFacturar.id
            ? { ...s, facturado: true, factura: facturaGuardada }
            : s
        )
      );
    }
    handleCloseFacturaModal();
  }, [salidaParaFacturar, handleCloseFacturaModal]);
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });

  const getTipoSalidaBadgeVariant = (tipo: Salida['tipo']) => {
    switch (tipo) {
      case 'Venta': return 'primary';
      case 'Donación': return 'info';
      case 'Ajuste': return 'warning';
      case 'Devolución': return 'secondary';
      default: return 'light';
    }
  };


  return (
    <Container fluid className="py-4 px-xl-5 px-md-4 px-3 bg-body-tertiary min-vh-100">
      <Card className="shadow-sm border-light">
        <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center py-3">
          <h2 className="mb-0 h5 d-flex align-items-center">
            <FaHistory className="me-2" /> Historial de Salidas de Inventario
          </h2>
          {/* Podrías añadir un botón para registrar nueva salida si es necesario desde aquí */}
        </Card.Header>
        <Card.Body className="p-3 p-md-4">
          {salidas.length === 0 ? (
            <div className="text-center py-5">
              <FaBoxOpen size="3em" className="text-muted mb-3" />
              <h5 className="text-muted">No hay salidas registradas.</h5>
              <p className="text-muted">El historial de salidas aparecerá aquí.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <Table striped bordered hover className="mt-2 align-middle inventory-history-table bg-white shadow-sm">
                <thead className="table-light text-uppercase small">
                  <tr>
                    <th style={{width: '5%'}}>ID</th>
                    <th style={{width: '12%'}}>Fecha</th>
                    <th>Producto</th>
                    <th style={{width: '10%'}} className="text-center">Cantidad</th>
                    <th style={{width: '12%'}} className="text-center">Tipo</th>
                    <th style={{width: '15%'}}>Cliente/Destino</th>
                    <th style={{width: '12%'}} className="text-end">Costo Total</th>
                    <th style={{width: '15%'}} className="text-center">Factura</th>
                    <th style={{width: '10%'}} className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {salidas.map((s) => (
                    <tr key={s.id}>
                      <td className="text-muted small">{s.id}</td>
                      <td>{formatDate(s.fecha)}</td>
                      <td>{s.nombreProducto}</td>
                      <td className="text-center">{s.cantidad}</td>
                      <td className="text-center">
                        <Badge bg={getTipoSalidaBadgeVariant(s.tipo)} text={getTipoSalidaBadgeVariant(s.tipo) === 'warning' ? 'dark' : 'white'} pill>
                          {s.tipo}
                        </Badge>
                      </td>
                       <td>{s.cliente || <span className="text-muted fst-italic">N/A</span>}</td>
                      <td className="text-end">{formatCurrency(s.costoTotal)}</td>
                      <td className="text-center">
                        {s.tipo === 'Venta' ? (
                          s.facturado && s.factura ? (
                            <Button size="sm" variant="outline-success" onClick={() => exportFacturaToPDF(s.factura!)} title="Ver Factura PDF">
                              <FaEye className="me-1" /> Ver PDF
                            </Button>
                          ) : (
                            <Button size="sm" variant="primary" onClick={() => handleOpenFacturaModal(s, true)} title="Generar Nueva Factura">
                              <FaPlus className="me-1" /> Generar
                            </Button>
                          )
                        ) : (
                          <Badge bg="light" text="dark" pill>No Aplica</Badge>
                        )}
                      </td>
                      <td className="text-center">
                        <Button size="sm" variant="outline-secondary" onClick={() => handleOpenEditModal(s)} title="Editar Salida">
                          <FaPencilAlt />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal para Editar Salida */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} centered backdrop="static">
        <Modal.Header closeButton className="bg-secondary text-white border-0">
          <Modal.Title className="h5 d-flex align-items-center">
            <FaPencilAlt className="me-2" /> Editar Registro de Salida
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {salidaParaEditar && (
            <Form>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-3" controlId="editNombreProducto">
                    <Form.Label className="small text-muted">Nombre del Producto</Form.Label>
                    <Form.Control
                      type="text"
                      value={salidaParaEditar.nombreProducto}
                      onChange={(e) => setSalidaParaEditar({ ...salidaParaEditar, nombreProducto: e.target.value })}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="editFechaSalida">
                    <Form.Label className="small text-muted">Fecha de Salida</Form.Label>
                    <Form.Control
                      type="date" // Usar tipo date para mejor UX
                      value={salidaParaEditar.fecha.split('T')[0]} // Asumir YYYY-MM-DD
                      onChange={(e) => setSalidaParaEditar({ ...salidaParaEditar, fecha: e.target.value })}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3" controlId="editCantidad">
                    <Form.Label className="small text-muted">Cantidad</Form.Label>
                    <Form.Control
                      type="number"
                      value={salidaParaEditar.cantidad}
                      onChange={(e) => setSalidaParaEditar({ ...salidaParaEditar, cantidad: Number(e.target.value) })}
                      min="0"
                    />
                  </Form.Group>
                </Col>
                <Col md={8}>
                  <Form.Group className="mb-3" controlId="editTipoSalida">
                    <Form.Label className="small text-muted">Tipo de Salida</Form.Label>
                    <Form.Select
                      value={salidaParaEditar.tipo}
                      onChange={(e) => setSalidaParaEditar({ ...salidaParaEditar, tipo: e.target.value as Salida['tipo'] })}
                    >
                      <option value="Venta">Venta</option>
                      <option value="Donación">Donación</option>
                      <option value="Ajuste">Ajuste</option>
                      <option value="Devolución">Devolución</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
               <Form.Group className="mb-3" controlId="editCliente">
                <Form.Label className="small text-muted">Cliente/Destino (Opcional)</Form.Label>
                <Form.Control
                  type="text"
                  value={salidaParaEditar.cliente || ''}
                  onChange={(e) => setSalidaParaEditar({ ...salidaParaEditar, cliente: e.target.value })}
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="editCostoTotal">
                <Form.Label className="small text-muted">Costo Total Asociado</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={salidaParaEditar.costoTotal}
                  onChange={(e) => setSalidaParaEditar({ ...salidaParaEditar, costoTotal: Number(e.target.value) })}
                  min="0"
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-body-tertiary border-top">
          <Button variant="outline-secondary" onClick={handleCloseEditModal}>
            <FaTimes className="me-1" /> Cancelar
          </Button>
          <Button variant="primary" onClick={handleSaveChangesSalida}>
            <FaSave className="me-1" /> Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal para Factura (Crear/Ver) */}
      {showFacturaModal && salidaParaFacturar && (
        <FacturaModalInternal
          show={showFacturaModal}
          onClose={handleCloseFacturaModal}
          onSave={handleSaveFacturaFromModal}
          initialFactura={facturaActualParaModal || undefined} // undefined para nueva factura
          // Podrías pasar datos de `salidaParaFacturar` a `FacturaModalInternal`
          // para pre-llenar la factura, ej. `clientName={salidaParaFacturar.cliente}`
          // o `items={[{ description: salidaParaFacturar.nombreProducto, quantity: salidaParaFacturar.cantidad, unitValue: salidaParaFacturar.costoTotal / salidaParaFacturar.cantidad, ... }]}`
          // Esto requeriría que FacturaModalInternal acepte estas props.
          // Por ahora, se asume que FacturaModalInternal maneja la creación de items.
        />
      )}
      <style type="text/css">{`
        .inventory-history-table {
          font-size: 0.9rem;
        }
        .inventory-history-table th {
          // font-weight: 600; // Ya es small y uppercase
        }
        .table-responsive { /* Estilos de scrollbar de la tarea anterior */
            scrollbar-width: thin;
            scrollbar-color: #adb5bd #dee2e6;
        }
        .table-responsive::-webkit-scrollbar {
            height: 8px;
            width: 8px;
        }
        .table-responsive::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
        }
        .table-responsive::-webkit-scrollbar-thumb {
            background: #adb5bd;
            border-radius: 10px;
        }
        .table-responsive::-webkit-scrollbar-thumb:hover {
            background: #555;
        }
      `}</style>
    </Container>
  );
};
