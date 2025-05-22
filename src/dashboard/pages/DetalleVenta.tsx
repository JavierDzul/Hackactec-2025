import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useCallback, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Card, // Importado para la nueva estructura
  Stack // Importado para posible uso en la barra de acciones
} from 'react-bootstrap';
import { FacturaModalInternal, type Factura } from './fact';
import { exportFacturaToPDF } from './facturaUtils';

interface Producto {
  id: string | number;
  img?: string;
  nombre: string;
  cantidadVendida: number;
  precioVenta: number;
}

// Componente placeholder de imagen mejorado
const ImagePlaceholder = () => (
  <div
    className="d-flex align-items-center justify-content-center"
    style={{
      width: '60px',
      height: '60px',
      backgroundColor: '#f8f9fa', // Un gris más claro y suave
      borderRadius: '0.375rem', // Bootstrap's default rounded
      color: '#6c757d',
      fontSize: '0.75rem',
      fontWeight: '500',
      border: '1px solid #dee2e6',
      userSelect: 'none'
    }}
  >
    SIN IMG
  </div>
);

export const VentaDetallePage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const initialProductos: Producto[] = location.state?.productos || [];
  const [productos] = useState<Producto[]>(initialProductos);

  const [metodoPago, setMetodoPago] = useState('');
  const [ventaConfirmada, setVentaConfirmada] = useState(false);
  const [mostrarConfirmModal, setMostrarConfirmModal] = useState(false);
  const [showFacturaModal, setShowFacturaModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Factura | null>(null);
  const [, setLastGeneratedFactura] = useState<Factura | undefined>();

  const total = useMemo(() =>
    productos.reduce((acc, p) => acc + p.precioVenta * p.cantidadVendida, 0),
    [productos]
  );

  const closeFacturaModalHandler = useCallback(() => {
    setShowFacturaModal(false);
    setSelectedInvoice(null);
  }, []);

  const openNewFacturaModal = useCallback(() => {
    if (!ventaConfirmada) return; // Doble seguridad
    setSelectedInvoice(null);
    setShowFacturaModal(true);
  }, [ventaConfirmada]);

  const handleSaveFacturaFromModal = useCallback((factura: Factura) => {
    setLastGeneratedFactura(factura);
    exportFacturaToPDF(factura);
  }, []);

  const handleOpenConfirmModal = useCallback(() => {
    if (productos.length > 0 && metodoPago) {
      setMostrarConfirmModal(true);
    }
  }, [productos, metodoPago]);

  const confirmarVenta = useCallback(() => {
    setVentaConfirmada(true);
    setMostrarConfirmModal(false);
  }, []);

  const handleCancelSale = useCallback(() => {
    navigate('/ventas');
  }, [navigate]);

  const handleNewSale = useCallback(() => {
    navigate('/ventas'); // Esto debería recargar y limpiar el estado
  }, [navigate]);

  const handleGenerateNota = useCallback(() => {
    if (!ventaConfirmada) return; // Doble seguridad
    console.log("Generar nota de venta para:", productos, "Total:", total, "Método de pago:", metodoPago);
    alert("Funcionalidad 'Generar Nota' pendiente de implementación.");
  }, [ventaConfirmada, productos, total, metodoPago]);

  const isConfirmButtonDisabled = productos.length === 0 || !metodoPago || ventaConfirmada;

  return (
    <Container fluid className="d-flex flex-column py-3" style={{ height: '100vh', backgroundColor: '#f4f6f8' }}>
      <Row className="flex-grow-1 overflow-hidden px-md-3">
        <Col className="d-flex flex-column h-100">
          <Card className="shadow-sm flex-grow-1 d-flex flex-column">
            <Card.Header className="bg-light border-bottom">
              <h4 className="mb-0 py-1">Detalle de Venta</h4>
            </Card.Header>
            <Card.Body className="overflow-auto p-0">
              <Table bordered hover responsive striped className="mb-0">
                <thead className="table-dark" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{ width: '80px' }}>Imagen</th>
                    <th>Nombre</th>
                    <th className="text-end" style={{ width: '100px' }}>Cantidad</th>
                    <th className="text-end" style={{ width: '120px' }}>Precio Venta</th>
                    <th className="text-end" style={{ width: '130px' }}>Total Producto</th>
                  </tr>
                </thead>
                <tbody style={{ verticalAlign: 'middle' }}>
                  {productos.length > 0 ? (
                    productos.map((p: Producto) => (
                      <tr key={p.id}>
                        <td className="text-center">
                          {p.img ? (
                            <img
                              src={p.img}
                              alt={p.nombre}
                              style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '0.375rem' }}
                            />
                          ) : (
                            <ImagePlaceholder />
                          )}
                        </td>
                        <td>{p.nombre}</td>
                        <td className="text-end">{p.cantidadVendida}</td>
                        <td className="text-end">${p.precioVenta.toFixed(2)}</td>
                        <td className="text-end fw-bold">${(p.precioVenta * p.cantidadVendida).toFixed(2)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center fst-italic py-5">
                        <div className="d-flex flex-column align-items-center">
                           <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" className="bi bi-cart-x mb-2 text-muted" viewBox="0 0 16 16">
                            <path d="M7.354 5.646a.5.5 0 1 0-.708.708L7.793 7.5 6.646 8.646a.5.5 0 1 0 .708.708L8.5 8.207l1.146 1.147a.5.5 0 0 0 .708-.708L9.207 7.5l1.147-1.146a.5.5 0 0 0-.708-.708L8.5 6.793 7.354 5.646z"/>
                            <path d="M.5 1a.5.5 0 0 0 0 1h1.11l.401 1.607 1.498 7.985A.5.5 0 0 0 4 12h1a2 2 0 1 0 0 4 2 2 0 0 0 0-4h7a2 2 0 1 0 0 4 2 2 0 0 0 0-4h1a.5.5 0 0 0 .491-.408l1.5-8A.5.5 0 0 0 14.5 3H2.89l-.405-1.621A.5.5 0 0 0 2 1H.5zm3.915 10L3.102 4h10.796l-1.313 7h-8.17zM6 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm7 0a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
                          </svg>
                          No hay productos en esta venta.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
            {productos.length > 0 && (
              <Card.Footer className="bg-light border-top">
                <Row className="align-items-center">
                  <Col>
                    <span className="text-muted">Total de la Venta:</span>
                  </Col>
                  <Col className="text-end">
                    <h3 className="mb-0 fw-bold display-5">${total.toFixed(2)}</h3>
                  </Col>
                </Row>
              </Card.Footer>
            )}
          </Card>
        </Col>
      </Row>

      {/* Barra inferior de acciones */}
      <Row className="bg-white py-3 px-md-3 mt-2 border-top shadow-lg">
        {!ventaConfirmada ? (
          <>
            <Col xs={12} md={3} className="d-grid mb-2 mb-md-0">
              <Button variant="outline-danger" size="lg" onClick={handleCancelSale}>
                Cancelar Venta
              </Button>
            </Col>
            <Col xs={12} md={9}>
              <Stack direction="horizontal" gap={2} className="justify-content-end flex-wrap">
                <Form.Select
                  value={metodoPago}
                  onChange={e => setMetodoPago(e.target.value)}
                  disabled={productos.length === 0}
                  size="lg"
                  aria-label="Seleccionar método de pago"
                  style={{ minWidth: '200px', maxWidth: '250px' }}
                  className="flex-grow-1 flex-sm-grow-0"
                >
                  <option value="">Método de Pago...</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Transferencia">Transferencia</option>
                </Form.Select>
                <Button
                  variant="success"
                  size="lg"
                  onClick={handleOpenConfirmModal}
                  disabled={isConfirmButtonDisabled}
                  className="flex-grow-1 flex-sm-grow-0"
                >
                  Confirmar Venta
                </Button>
                <Button variant="outline-secondary" size="lg" disabled className="flex-grow-1 flex-sm-grow-0">
                  Generar Nota
                </Button>
                <Button variant="outline-secondary" size="lg" disabled className="flex-grow-1 flex-sm-grow-0">
                  Generar Factura
                </Button>
              </Stack>
            </Col>
          </>
        ) : (
          <>
            <Col xs={12} md={3} className="d-grid mb-2 mb-md-0">
              <Button variant="outline-primary" size="lg" onClick={handleNewSale}>
                Iniciar Nueva Venta
              </Button>
            </Col>
            <Col xs={12} md={9} className="d-flex flex-column align-items-end">
                <Alert variant="success" className="mb-2 py-2 px-3 w-100 text-center text-md-start">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" className="bi bi-check-circle-fill me-2" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                  </svg>
                  <strong>Venta Confirmada!</strong> Método de pago: {metodoPago}.
                </Alert>
              <Stack direction="horizontal" gap={2} className="justify-content-end w-100">
                <Button variant="info" size="lg" onClick={handleGenerateNota} className="text-white flex-grow-1 flex-sm-grow-0">
                  Generar Nota
                </Button>
                <Button variant="dark" size="lg" onClick={openNewFacturaModal} className="flex-grow-1 flex-sm-grow-0">
                  Generar Factura
                </Button>
              </Stack>
            </Col>
          </>
        )}
      </Row>

      <Modal show={mostrarConfirmModal} onHide={() => setMostrarConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" className="bi bi-question-circle-fill me-2" viewBox="0 0 16 16">
              <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.496 6.033h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286a.237.237 0 0 0 .241.247zm2.325 6.443c-.586 0-1.009-.394-1.009-.927 0-.552.423-.927 1.01-.927.609 0 1.028.375 1.028.927 0 .533-.42.927-1.029.927z"/>
            </svg>
            Confirmar Venta
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p className="fs-5">¿Estás seguro de que deseas confirmar esta venta?</p>
          <p className="mb-1"><strong>Total:</strong> <span className="fs-4 text-success fw-bold">${total.toFixed(2)}</span></p>
          <p><strong>Método de Pago:</strong> <span className="fw-bold">{metodoPago}</span></p>
        </Modal.Body>
        <Modal.Footer className="justify-content-center">
          <Button variant="outline-secondary" size="lg" onClick={() => setMostrarConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="success" size="lg" onClick={confirmarVenta}>
            Sí, Confirmar
          </Button>
        </Modal.Footer>
      </Modal>

      {showFacturaModal && (
          <FacturaModalInternal
            show={showFacturaModal}
            onClose={closeFacturaModalHandler}
            onSave={handleSaveFacturaFromModal}
            initialFactura={selectedInvoice || undefined}
          />
      )}
    </Container>
  );
};