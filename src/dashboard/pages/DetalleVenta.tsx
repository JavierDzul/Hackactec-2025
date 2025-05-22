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

export const VentaDetallePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const productos = location.state?.productos || [];

  const [metodoPago, setMetodoPago] = useState('');
  const [ventaConfirmada, setVentaConfirmada] = useState(false);
  const [mostrarConfirmModal, setMostrarConfirmModal] = useState(false);

  const total = productos.reduce(
    (acc: number, p: any) => acc + p.precioVenta * p.cantidadVendida,
    0
  );

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

          <Button variant="info" disabled={!ventaConfirmada}>
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
    </Container>
  );
};
