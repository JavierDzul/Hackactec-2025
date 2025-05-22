import { Container, Table, Button, Row, Col, Form, Modal } from 'react-bootstrap';
import { useState } from 'react';
import FacturaModal from '../utils/FacturaModal';
import type { Factura } from './fact';

interface Salida {
  id: number;
  nombre: string;
  cantidad: number;
  tipo: string;
  costo: number;
  facturado: boolean;
}

const salidasIniciales: Salida[] = [
  { id: 1, nombre: 'Jabón', cantidad: 5, tipo: 'Venta', costo: 50, facturado: true },
  { id: 2, nombre: 'Shampoo', cantidad: 2, tipo: 'Donación', costo: 0, facturado: false },
  { id: 3, nombre: 'Jabón', cantidad: 7, tipo: 'Venta', costo: 100, facturado: false }
];


export const HistorialSalidasPage = () => {
    
  const [salidas, setSalidas] = useState<Salida[]>(salidasIniciales);
  const [mostrarModal, setMostrarModal] = useState(false);
    const [salidaSeleccionada, setSalidaSeleccionada] = useState<Salida | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"PDF" | "XML" | "VIEW" | "NEW" | "">("");
  const [invoices, setInvoices] = useState<Factura[]>([]);

    const handleEditar = (salida: Salida) => {
  setSalidaSeleccionada(salida);
  setMostrarModal(true);
};

const openNewFacturaModal = (s: Salida) => {
    setSalidaSeleccionada(s)
    setModalType("NEW");
    setShowModal(true);
  };

  const handleSaveFacturaFromModal = (factura: Factura) => {
      setInvoices([factura, ...invoices]);
      setSalidaSeleccionada({ ...salidaSeleccionada!, facturado: true })
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
                    <Button size="sm" variant="success">
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

<FacturaModal
        show={showModal && modalType === "NEW"}
        onClose={() => {
          setShowModal(false);
          setModalType("");
        }}
        onSave={handleSaveFacturaFromModal}
      />


    </Container>
  );
};
