import { Container, Table, Button, Row, Col, Form, Modal, Card, Alert, Stack } from 'react-bootstrap';
import { useEffect, useState, useCallback } from 'react';
import { edirServ } from '../NavBar'; // Asumo que esta es tu función para guardar en localStorage
import { FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaExclamationTriangle, FaClipboardList, FaBoxOpen } from 'react-icons/fa';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  fecha: string; // Mantendremos string, pero el default será YYYY-MM-DD
  cobro: number;
  costo: number;
}

// Estado inicial para un nuevo servicio o para el formulario
const initialServicioState: Servicio = {
  id: 0, // Se asignará dinámicamente
  nombre: '',
  descripcion: '',
  fecha: new Date().toISOString().split('T')[0], // Default a hoy en YYYY-MM-DD
  cobro: 0,
  costo: 0,
};

export const ServiciosPage = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [listaServicios, setListaServicios] = useState<Servicio[]>([]);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [servicioAEliminar, setServicioAEliminar] = useState<Servicio | null>(null);
  const [cuentaID, setCuentaID] = useState(1); // Siguiente ID a usar
  const [servicioActual, setServicioActual] = useState<Servicio>(initialServicioState);

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

  const abrirModalParaEditar = useCallback((servicio: Servicio) => {
    setServicioActual(servicio);
    setModoEdicion(true);
    setMostrarModal(true);
  }, []);

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
    </Container>
  );
};