import React, { useEffect, useState, useMemo } from 'react';
import { Button, Table, Modal, Form, Row, Col, Container, Card, InputGroup, FormControl, Image, Alert } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaBoxOpen, FaSearch, FaSave, FaTimes, FaHistory, FaExclamationTriangle, FaImage } from 'react-icons/fa';
// Asumo que editProd es una función que actualiza el estado global o localStorage
// import { editProd } from '../NavBar'; // La mantendré comentada si no es esencial para el renderizado visual
import { useNavigate } from 'react-router-dom';

// Simulación de la función editProd si no está disponible
const editProd = (productos: Producto[]) => {
  console.log("Guardando productos (simulado):", productos);
  localStorage.setItem('productos', JSON.stringify(productos));
};


export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
  proveedor: string;
  img: string | ArrayBuffer | null;
  // Nuevos campos para sofisticación
  categoria?: string;
  sku?: string;
  fechaAgregado?: string;
  ultimaModificacion?: string;
}

const initialProductState: Producto = {
  id: 0,
  nombre: '',
  descripcion: '',
  cantidad: 0,
  precioCompra: 0,
  precioVenta: 0,
  proveedor: '',
  img: null,
  categoria: '',
  sku: '',
  fechaAgregado: new Date().toISOString(),
  ultimaModificacion: new Date().toISOString(),
};

export const InventarioPage = () => {
  const navigate = useNavigate();

  const [listaProductos, setListaProductos] = useState<Producto[]>([]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [productoActual, setProductoActual] = useState<Producto>(initialProductState);
  const [terminoBusqueda, setTerminoBusqueda] = useState('');

  useEffect(() => {
    const datosGuardados = localStorage.getItem('productos');
    if (datosGuardados) {
      const productosParseados: Producto[] = JSON.parse(datosGuardados);
      setListaProductos(productosParseados);
    } else {
      // Datos de ejemplo si no hay nada en localStorage para la demostración
      setListaProductos([
        { id: 1, nombre: "Laptop Pro X", descripcion: "Laptop de alto rendimiento para profesionales", cantidad: 15, precioCompra: 800, precioVenta: 1200, proveedor: "TechCorp", img: "https://via.placeholder.com/150/007bff/FFFFFF?Text=LaptopPro", categoria: "Electrónicos", sku: "LPX-001", fechaAgregado: new Date().toISOString(), ultimaModificacion: new Date().toISOString() },
        { id: 2, nombre: "Silla Ergonómica Deluxe", descripcion: "Silla de oficina con soporte lumbar avanzado", cantidad: 30, precioCompra: 150, precioVenta: 250, proveedor: "OfficeComfort Ltd.", img: "https://via.placeholder.com/150/28a745/FFFFFF?Text=SillaErgo", categoria: "Mobiliario", sku: "SED-002", fechaAgregado: new Date().toISOString(), ultimaModificacion: new Date().toISOString() },
      ]);
    }
  }, []);

  const productosFiltrados = useMemo(() => {
    if (!terminoBusqueda) return listaProductos;
    return listaProductos.filter(p =>
      p.nombre.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      p.proveedor.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      p.categoria?.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
      p.sku?.toLowerCase().includes(terminoBusqueda.toLowerCase())
    );
  }, [listaProductos, terminoBusqueda]);

  const generarIdUnico = () => {
    return listaProductos.length > 0 ? Math.max(...listaProductos.map(p => p.id)) + 1 : 1;
  };

  const abrirModalParaAgregar = () => {
    setProductoActual({
      ...initialProductState,
      id: generarIdUnico(),
      fechaAgregado: new Date().toISOString(),
      ultimaModificacion: new Date().toISOString(),
    });
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const abrirModalParaEditar = (producto: Producto) => {
    setProductoActual({
      ...producto,
      ultimaModificacion: new Date().toISOString(),
    });
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const eliminarProducto = () => {
    if (productoAEliminar) {
      const nuevaLista = listaProductos.filter(p => p.id !== productoAEliminar.id);
      setListaProductos(nuevaLista);
      editProd(nuevaLista);
      setProductoAEliminar(null);
      setMostrarConfirmacion(false);
    }
  };

  const confirmarEliminacion = (producto: Producto) => {
    setProductoAEliminar(producto);
    setMostrarConfirmacion(true);
  };

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductoActual(prev => ({
      ...prev,
      [name]: name === 'cantidad' || name.startsWith('precio') ? parseFloat(value) || 0 : value,
      ultimaModificacion: new Date().toISOString(),
    }));
  };

  const manejarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductoActual(prev => ({ ...prev, img: reader.result, ultimaModificacion: new Date().toISOString() }));
      };
      reader.readAsDataURL(file);
    }
  };

  const guardarProducto = () => {
    const productoConFecha = {
      ...productoActual,
      ultimaModificacion: new Date().toISOString(),
      fechaAgregado: modoEdicion ? productoActual.fechaAgregado : new Date().toISOString()
    };

    let nuevaLista;
    if (modoEdicion) {
      nuevaLista = listaProductos.map(p => (p.id === productoConFecha.id ? productoConFecha : p));
    } else {
      nuevaLista = [...listaProductos, productoConFecha];
    }
    setListaProductos(nuevaLista);
    editProd(nuevaLista);
    setMostrarModal(false);
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString('es-MX') : 'N/A';


  return (
    <Container fluid className="mt-4 p-xl-5 p-md-4 p-3 bg-light inventory-page">
      <Card className="shadow-lg border-0">
        <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center py-3">
          <h2 className="mb-0 h4"><FaBoxOpen className="me-2" /> Gestión de Inventario</h2>
          <Button onClick={() => navigate('/historial-salidas')} variant="outline-light" size="sm">
            <FaHistory className="me-1" /> Historial de Salidas
          </Button>
        </Card.Header>
        <Card.Body className="p-4">
          <Row className="mb-3">
            <Col md={6} lg={4}>
              <Button onClick={abrirModalParaAgregar} variant="success" className="w-100 mb-2 mb-md-0">
                <FaPlus className="me-2" /> Agregar Nuevo Producto
              </Button>
            </Col>
            <Col md={6} lg={8}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0"><FaSearch /></InputGroup.Text>
                <FormControl
                  placeholder="Buscar por nombre, proveedor, categoría, SKU..."
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            </Col>
          </Row>

          {productosFiltrados.length > 0 ? (
            <Table responsive striped bordered hover className="mt-3 inventory-table shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>#</th>
                  <th>Imagen</th>
                  <th>Nombre (SKU)</th>
                  <th>Categoría</th>
                  <th>Descripción</th>
                  <th className="text-center">Cantidad</th>
                  <th className="text-end">P. Compra</th>
                  <th className="text-end">P. Venta</th>
                  <th>Proveedor</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productosFiltrados.map((producto, index) => (
                  <tr key={producto.id} className="align-middle">
                    <td>{index + 1}</td>
                    <td className="text-center">
                      {producto.img ? (
                        <Image src={producto.img.toString()} alt={producto.nombre} width="70" height="70" rounded style={{objectFit: 'cover'}}/>
                      ) : (
                        <div className="text-muted" style={{width: 70, height: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '.25rem'}}>
                           <FaImage size="1.5em"/>
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{producto.nombre}</strong>
                      <br />
                      <small className="text-muted">SKU: {producto.sku || 'N/A'}</small>
                    </td>
                    <td>{producto.categoria || 'N/A'}</td>
                    <td style={{maxWidth: '200px', whiteSpace: 'normal'}}>{producto.descripcion}</td>
                    <td className="text-center fw-bold">{producto.cantidad}</td>
                    <td className="text-end">{formatCurrency(producto.precioCompra)}</td>
                    <td className="text-end">{formatCurrency(producto.precioVenta)}</td>
                    <td>{producto.proveedor}</td>
                    <td className="text-center">
                      <Button variant="outline-primary" size="sm" onClick={() => abrirModalParaEditar(producto)} className="me-1 mb-1 mb-md-0" title="Editar">
                        <FaEdit />
                      </Button>
                      <Button variant="outline-danger" size="sm" onClick={() => confirmarEliminacion(producto)} title="Eliminar">
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <Alert variant="info" className="mt-3 text-center">
              <FaSearch className="me-2"/> No se encontraron productos con los criterios de búsqueda o el inventario está vacío.
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="lg" backdrop="static" centered>
        <Modal.Header closeButton className={modoEdicion ? "bg-warning text-dark" : "bg-success text-white"}>
          <Modal.Title className="h5">
            {modoEdicion ? <><FaEdit className="me-2" /> Editar Producto </> : <><FaPlus className="me-2" /> Agregar Nuevo Producto</>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form>
            <Row>
              <Col md={8}>
                <Form.Group controlId="nombre" className="mb-3">
                  <Form.Label className="fw-semibold">Nombre del Producto</Form.Label>
                  <Form.Control type="text" name="nombre" value={productoActual.nombre} onChange={manejarCambio} placeholder="Ej: Camiseta de Algodón" required />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="sku" className="mb-3">
                  <Form.Label className="fw-semibold">SKU</Form.Label>
                  <Form.Control type="text" name="sku" value={productoActual.sku || ''} onChange={manejarCambio} placeholder="Ej: CAM-ALG-001"/>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="descripcion" className="mb-3">
              <Form.Label className="fw-semibold">Descripción</Form.Label>
              <Form.Control as="textarea" rows={3} name="descripcion" value={productoActual.descripcion} onChange={manejarCambio} placeholder="Breve descripción del producto, características principales..." />
            </Form.Group>
            <Row>
              <Col md={4}>
                <Form.Group controlId="categoria" className="mb-3">
                  <Form.Label className="fw-semibold">Categoría</Form.Label>
                  <Form.Control type="text" name="categoria" value={productoActual.categoria || ''} onChange={manejarCambio} placeholder="Ej: Ropa, Electrónicos"/>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="cantidad" className="mb-3">
                  <Form.Label className="fw-semibold">Cantidad en Stock</Form.Label>
                  <Form.Control type="number" name="cantidad" value={productoActual.cantidad} onChange={manejarCambio} min="0" />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="proveedor" className="mb-3">
                  <Form.Label className="fw-semibold">Proveedor</Form.Label>
                  <Form.Control type="text" name="proveedor" value={productoActual.proveedor} onChange={manejarCambio} placeholder="Nombre del proveedor" />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group controlId="precioCompra" className="mb-3">
                  <Form.Label className="fw-semibold">Precio de Compra (MXN)</Form.Label>
                  <Form.Control type="number" step="0.01" name="precioCompra" value={productoActual.precioCompra} onChange={manejarCambio} min="0" />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="precioVenta" className="mb-3">
                  <Form.Label className="fw-semibold">Precio de Venta (MXN)</Form.Label>
                  <Form.Control type="number" step="0.01" name="precioVenta" value={productoActual.precioVenta} onChange={manejarCambio} min="0" />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="imagen" className="mb-3">
              <Form.Label className="fw-semibold">Imagen del Producto</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={manejarImagen} />
              {productoActual.img && (
                <div className="mt-3 text-center">
                  <Image src={productoActual.img.toString()} alt="Vista previa" thumbnail style={{ maxHeight: '150px' }} />
                </div>
              )}
            </Form.Group>
            <small className="text-muted d-block">
              ID: {productoActual.id} | 
              Agregado: {formatDate(productoActual.fechaAgregado)} | 
              Últ. Mod.: {formatDate(productoActual.ultimaModificacion)}
            </small>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light border-top-0">
          <Button variant="outline-secondary" onClick={() => setMostrarModal(false)}>
            <FaTimes className="me-1" /> Cancelar
          </Button>
          <Button variant={modoEdicion ? "warning" : "success"} onClick={guardarProducto}>
            <FaSave className="me-1" /> {modoEdicion ? 'Guardar Cambios' : 'Agregar Producto'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarConfirmacion} onHide={() => setMostrarConfirmacion(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="h5"><FaExclamationTriangle className="me-2" /> Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro de que desea eliminar el producto: <strong>{productoAEliminar?.nombre}</strong> (SKU: {productoAEliminar?.sku || 'N/A'})? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer className="bg-light border-top-0">
          <Button variant="secondary" onClick={() => setMostrarConfirmacion(false)}>
            <FaTimes className="me-1" /> Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarProducto}>
            <FaTrash className="me-1" /> Eliminar Definitivamente
          </Button>
        </Modal.Footer>
      </Modal>
      <style type="text/css">{`
        .inventory-page {
          background-color: #f8f9fa; // Un fondo ligeramente gris para la página
        }
        .inventory-table th {
          font-weight: 600; // Encabezados de tabla más notorios
        }
        .inventory-table img {
          transition: transform 0.2s ease-in-out;
        }
        .inventory-table img:hover {
          transform: scale(1.5); // Efecto de zoom sutil en la imagen
        }
        .form-label.fw-semibold {
            font-weight: 500 !important; // Asegurar que los labels sean semibold
        }
        .modal-title.h5 {
            font-size: 1.1rem; // Tamaño de título de modal ajustado
        }
        .btn-outline-light:hover {
            color: #000 !important; // Mejor contraste en hover para botón historial
        }
      `}</style>
    </Container>
  );
};