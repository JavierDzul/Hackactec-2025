import { Container, Table, Button, Row, Col, Form, Modal, Card, Alert, Stack } from 'react-bootstrap';
import { useEffect, useState, useCallback } from 'react';
import { edirServ } from '../NavBar'; // Asumo que esta es tu función para guardar en localStorage
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaExclamationTriangle, FaClipboardList, FaBoxOpen } from 'react-icons/fa';
import { FacturaModalInternal, type Factura, type Item as FacturaItem, type Tax as FacturaTax, type TaxStamp as FacturaTaxStamp, type Issuer as FacturaIssuer, type Receiver as FacturaReceiver } from './fact'; // Asegúrate que la ruta y tipos sean correctos
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string; // Mantendremos string, pero el default será YYYY-MM-DD
  cobro: number;
  costo: number;
  factura: Factura|null
}

// Estado inicial para un nuevo servicio o para el formulario
const initialServicioState: Servicio = {
  id: 0, // Se asignará dinámicamente
  nombre: '',
  descripcion: '',
  fecha: new Date().toISOString().split('T')[0], // Default a hoy en YYYY-MM-DD
  cobro: 0,
  costo: 0,
  factura: null
};

export const ServiciosPage = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [listaServicios, setListaServicios] = useState<Servicio[]>([]);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState<Servicio | null>(null);
  const [cuentaID, setCuentaID] = useState(1); // Siguiente ID a usar
  const [servicioActual, setServicioActual] = useState<Servicio>(initialServicioState);
  const [servicioParaFacturar, setServicioParaFacturar] = useState<Servicio | null>(null);
    const [facturaActualParaModal, setFacturaActualParaModal] = useState<Factura | null>(null);
    const [showFacturaModal, setShowFacturaModal] = useState<boolean>(false);

  const handleOpenFacturaModal = useCallback((servicio: Servicio, esNueva: boolean) => {
      setServicioParaFacturar(servicio);
      if (esNueva) {
        setFacturaActualParaModal(null); // Para generar una nueva factura
      } else {
        setFacturaActualParaModal(servicio.factura); // Para ver/editar una factura existente
      }
      setShowFacturaModal(true);
    }, []);

  useEffect(() => {
    const datosGuardados = localStorage.getItem('servicios');
    if (datosGuardados) {
      try {
        const serviciosRecuperados: Servicio[] = JSON.parse(datosGuardados);
        if (Array.isArray(serviciosRecuperados)) {
          setListaServicios(serviciosRecuperados);
          if (serviciosRecuperados.length > 0) {
            const maxId = Math.max(...serviciosRecuperados.map(s => s.id), 0);
            setCuentaID(maxId + 1);
          } else {
            setCuentaID(1);
          }
        } else {
           setListaServicios([]);
           setCuentaID(1);
        }
      } catch (error) {
        console.error("Error al parsear servicios de localStorage:", error);
        setListaServicios([]);
        setCuentaID(1);
      }
    } else {
      setListaServicios([]);
      setCuentaID(1);
    }
  }, []);

  const guardarServiciosEnStorage = useCallback((servicios: Servicio[]) => {
    // Envolver edirServ para asegurar que se llame con la lista correcta
    // y para facilitar la centralización de la lógica de guardado si es necesario.
    edirServ(servicios);
  }, []);


  const guardarServicio = useCallback(() => {
    let updatedList: Servicio[];
    if (modoEdicion) {
      updatedList = listaServicios.map(s => (s.id === servicioActual.id ? servicioActual : s));
    } else {
      // Asignar el ID actual y prepararse para el siguiente
      const nuevoServicioConId = { ...servicioActual, id: cuentaID };
      updatedList = [...listaServicios, nuevoServicioConId];
      setCuentaID(prevId => prevId + 1); // Incrementar para el próximo servicio
    }
    setListaServicios(updatedList);
    guardarServiciosEnStorage(updatedList);
    setMostrarModal(false);
  }, [modoEdicion, listaServicios, servicioActual, cuentaID, guardarServiciosEnStorage]);

  const abrirModalParaAgregar = useCallback(() => {
    setServicioActual({
      ...initialServicioState, // Usar el estado inicial con fecha de hoy
      id: cuentaID, // Asignar el ID que se usará si se guarda
    });
    setModoEdicion(false);
    setMostrarModal(true);
  }, [cuentaID]);

  const handleCloseFacturaModal = useCallback(() => {
      setShowFacturaModal(false);
      setServicioParaFacturar(null);
      setFacturaActualParaModal(null);
    }, []);

  const abrirModalParaEditar = useCallback((servicio: Servicio) => {
    setServicioActual(servicio);
    setModoEdicion(true);
    setMostrarModal(true);
  }, []);

  const handleSaveFacturaFromModal = useCallback((facturaGuardada: Factura) => {
      if (servicioParaFacturar) {
        setListaServicios(prevSalidas =>
          prevSalidas.map(s =>
            s.id === servicioParaFacturar.id
              ? { ...s, facturado: true, factura: facturaGuardada }
              : s
          )
        );
      }
      handleCloseFacturaModal();
    }, [servicioParaFacturar, handleCloseFacturaModal]);

  const confirmarEliminacion = useCallback((servicio: Servicio) => {
    setServicioAEliminar(servicio);
    setMostrarConfirmacion(true);
  }, []);

  const eliminarServicioCallback = useCallback(() => {
    if (servicioAEliminar) {
      const updatedList = listaServicios.filter(s => s.id !== servicioAEliminar.id);
      setListaServicios(updatedList);
      guardarServiciosEnStorage(updatedList);
      setServicioAEliminar(null);
      setMostrarConfirmacion(false);
    }
  }, [listaServicios, servicioAEliminar, guardarServiciosEnStorage]);

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

  const manejarCambio = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setServicioActual(prev => {
      if (name === 'cobro' || name === 'costo') {
        const numValue = parseFloat(value);
        return { ...prev, [name]: isNaN(numValue) ? 0 : numValue };
      }
      return { ...prev, [name]: value };
    });
  }, []);

  

  const handleCloseModal = useCallback(() => setMostrarModal(false), []);
  const handleCloseConfirmacion = useCallback(() => setMostrarConfirmacion(false), []);

  return (
    <Container fluid className="p-3 p-md-4 bg-light min-vh-100">
      <Card className="shadow-sm">
        <Card.Header className="bg-dark text-white d-flex justify-content-between align-items-center py-3">
          <h4 className="mb-0 d-flex align-items-center">
            <FaClipboardList className="me-2" /> Gestión de Servicios
          </h4>
          <Button onClick={abrirModalParaAgregar} variant="success">
            <FaPlus className="me-2" /> Agregar Servicio
          </Button>
        </Card.Header>
        <Card.Body>
          {listaServicios.length === 0 ? (
            <Alert variant="info" className="text-center py-4">
              <FaBoxOpen size={40} className="mb-3" />
              <h5 className="mb-0">No hay servicios registrados.</h5>
              <p className="mb-0">Comienza agregando un nuevo servicio.</p>
            </Alert>
          ) : (
            <Table bordered hover responsive striped className="align-middle">
              <thead className="table-dark">
                <tr>
                  <th style={{width: '5%'}}>ID</th>
                  <th>Servicio</th>
                  <th>Descripción</th>
                  <th style={{width: '10%'}}>Fecha</th>
                  <th className="text-end" style={{width: '12%'}}>Cobro</th>
                  <th className="text-end" style={{width: '12%'}}>Costo</th>
                  <th className="text-center" style={{width: '15%'}}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {listaServicios.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.nombre}</td>
                    <td>{s.descripcion}</td>
                    <td>{s.fecha}</td>
                    <td className="text-end">${parseFloat(s.cobro.toString()).toFixed(2)}</td>
                    <td className="text-end">${parseFloat(s.costo.toString()).toFixed(2)}</td>
                    <td className="text-center">
                      <Stack direction="horizontal" gap={2} className="justify-content-center">
                        <Button variant="outline-primary" size="sm" onClick={() => abrirModalParaEditar(s)}>
                          <FaEdit className="me-1" /> Editar
                        </Button>
                        <Button variant="outline-danger" size="sm" onClick={() => confirmarEliminacion(s)}>
                          <FaTrash className="me-1" /> Eliminar
                        </Button>
                        {(
                            s.factura ? (
                              <Button size="sm" variant="outline-success" onClick={() => exportFacturaToPDF(s.factura!)} title="Ver Factura PDF">
                                 Factura PDF
                              </Button>
                            ) : (
                              <Button size="sm" variant="primary" onClick={() => handleOpenFacturaModal(s, true)} title="Generar Nueva Factura">
                                <FaPlus className="me-1" /> Facturar
                              </Button>
                            )
                          )}
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={mostrarModal} onHide={handleCloseModal} size="lg" centered>
        <Modal.Header closeButton className={modoEdicion ? "bg-primary text-white" : "bg-success text-white"}>
          <Modal.Title className="d-flex align-items-center">
            {modoEdicion ? <FaEdit className="me-2" /> : <FaPlus className="me-2" />}
            {modoEdicion ? 'Editar Servicio' : 'Agregar Nuevo Servicio'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group controlId="nombre" className="mb-3">
                  <Form.Label>Nombre del Servicio</Form.Label>
                  <Form.Control
                    type="text"
                    name="nombre"
                    value={servicioActual.nombre}
                    onChange={manejarCambio}
                    placeholder="Ej: Mantenimiento Web Básico"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="fecha" className="mb-3">
                  <Form.Label>Fecha del Servicio</Form.Label>
                  <Form.Control
                    type="text" // O considera type="date" si el formato es siempre YYYY-MM-DD
                    name="fecha"
                    value={servicioActual.fecha}
                    onChange={manejarCambio}
                    placeholder="YYYY-MM-DD"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group controlId="descripcion" className="mb-3">
              <Form.Label>Descripción Detallada</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="descripcion"
                value={servicioActual.descripcion}
                onChange={manejarCambio}
                placeholder="Detalles del servicio prestado..."
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group controlId="cobro" className="mb-3">
                  <Form.Label>Monto Cobrado al Cliente ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="cobro"
                    value={servicioActual.cobro}
                    onChange={manejarCambio}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="costo" className="mb-3">
                  <Form.Label>Costo Interno del Servicio ($)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="costo"
                    value={servicioActual.costo}
                    onChange={manejarCambio}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={handleCloseModal}>
            <FaTimes className="me-2" /> Cancelar
          </Button>
          <Button variant={modoEdicion ? "primary" : "success"} onClick={guardarServicio}>
            <FaSave className="me-2" /> Guardar Cambios
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarConfirmacion} onHide={handleCloseConfirmacion} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="d-flex align-items-center">
            <FaExclamationTriangle className="me-2" /> Confirmar Eliminación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="fs-5">
            ¿Estás realmente seguro de que deseas eliminar el servicio: <strong>{servicioAEliminar?.nombre}</strong>?
          </p>
          <p className="text-muted">Esta acción no se puede deshacer.</p>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={handleCloseConfirmacion}>
            <FaTimes className="me-2" /> No, Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarServicioCallback}>
            <FaTrash className="me-2" /> Sí, Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

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
    </Container>
  );
};