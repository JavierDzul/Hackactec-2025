import { Container, Table, Button, Row, Col, Form, Modal } from 'react-bootstrap';
import { useState } from 'react';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string;
  cobro: number;
  costo: number;
}

const SERVICIOS_TURISMO: Servicio[] = [
  {
    id: 1,
    nombre: "Tour a Teotihuacán",
    descripcion: "Recorrido guiado por la zona arqueológica de Teotihuacán, incluye transporte y entradas.",
    fecha: "2025-06-10",
    cobro: 2000,
    costo: 1200
  },
  {
    id: 2,
    nombre: "Tour Xochimilco",
    descripcion: "Paseo en trajinera por los canales de Xochimilco con guía y comida típica.",
    fecha: "2025-06-12",
    cobro: 1800,
    costo: 1000
  },
  {
    id: 3,
    nombre: "Tour Centro Histórico",
    descripcion: "Caminata guiada por el centro histórico de la ciudad, incluye entradas a museos.",
    fecha: "2025-06-15",
    cobro: 1500,
    costo: 900
  },
  {
    id: 4,
    nombre: "Tour a Coyoacán y Frida Kahlo",
    descripcion: "Visita a Coyoacán, mercado y Museo Frida Kahlo, transporte incluido.",
    fecha: "2025-06-18",
    cobro: 1700,
    costo: 1100
  },
  {
    id: 5,
    nombre: "Tour gastronómico",
    descripcion: "Recorrido por los mejores restaurantes y mercados de la ciudad.",
    fecha: "2025-06-20",
    cobro: 2200,
    costo: 1400
  }
];

export const ServiciosPage = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Inicializa con los servicios turísticos hardcodeados
  const [listaServicios, setListaServicios] = useState<Servicio[]>(SERVICIOS_TURISMO);

  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState<Servicio | null>(null);

  const [cuentaID, setCuentaID] = useState(SERVICIOS_TURISMO.length + 1);
  const [servicioActual, setServicioActual] = useState<Servicio>({
    id: 0,
    nombre: '',
    descripcion: "",
    fecha: '',
    cobro: 0,
    costo: 0
  });

  const guardarServicio = () => {
    if (modoEdicion) {
      setListaServicios(listaServicios.map(p => (p.id === servicioActual.id ? servicioActual : p)));
    } else {
      setListaServicios([...listaServicios, servicioActual]);
      setCuentaID(cuentaID + 1);
    }
    setMostrarModal(false);
  };

  const abrirModalParaAgregar = () => {
    setServicioActual({
      id: cuentaID,
      nombre: '',
      descripcion: "",
      fecha: '',
      cobro: 0,
      costo: 0
    });
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const abrirModalParaEditar = (servicio: Servicio) => {
    setServicioActual(servicio);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const confirmarEliminacion = (servicio: Servicio) => {
    setServicioAEliminar(servicio);
    setMostrarConfirmacion(true);
  };

  const eliminarServicio = () => {
    if (servicioAEliminar) {
      setListaServicios(listaServicios.filter(p => p.id !== servicioAEliminar.id));
      setServicioAEliminar(null);
      setMostrarConfirmacion(false);
    }
  };

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setServicioActual({ ...servicioActual, [name]: name === 'cobro' || name === 'costo' ? parseFloat(value) : value });
  };

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h3>Servicios</h3>
        </Col>
      </Row>

      <Row className="mb-3 justify-content-between align-items-center px-3">
        <Col xs="auto">
          <Button onClick={() => abrirModalParaAgregar()} variant="primary">
            Agregar servicio
          </Button>
        </Col>
      </Row>

      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Servicio</th>
            <th>Descripción</th>
            <th>Fecha</th>
            <th>Cobro del servicio</th>
            <th>Costo por servir</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {listaServicios.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>{s.nombre}</td>
              <td>{s.descripcion}</td>
              <td>{s.fecha}</td>
              <td>${parseFloat(s.cobro.toString()).toFixed(2)}</td>
              <td>${parseFloat(s.costo.toString()).toFixed(2)}</td>
              <td>
                <Button variant="warning" onClick={() => abrirModalParaEditar(s)}>
                  Editar
                </Button>
                <Button variant="danger" className="ms-2" onClick={() => confirmarEliminacion(s)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicion ? 'Editar Servicio' : 'Agregar Servicio'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={servicioActual.nombre}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group controlId="descripcion" className="mt-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="descripcion"
                value={servicioActual.descripcion}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group controlId="fecha">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="text"
                name="fecha"
                value={servicioActual.fecha}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group controlId="cobro" className="mt-3">
              <Form.Label>Cobro</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="cobro"
                value={servicioActual.cobro}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group controlId="costo" className="mt-3">
              <Form.Label>Costo</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="costo"
                value={servicioActual.costo}
                onChange={manejarCambio}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarServicio}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarConfirmacion} onHide={() => setMostrarConfirmacion(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Estás seguro de que deseas eliminar el servicio{' '}
          <strong>{servicioAEliminar?.nombre}</strong>?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarConfirmacion(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarServicio}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
