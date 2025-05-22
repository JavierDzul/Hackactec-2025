import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Button, Table, Modal, Form, Row, Col, Container, Card, InputGroup, FormControl, Image, Alert, Badge, ButtonGroup, Stack } from 'react-bootstrap';
import { FaPlus, FaEdit, FaTrash, FaBoxOpen, FaSearch, FaSave, FaTimes, FaHistory, FaExclamationTriangle, FaImage, FaUpload, FaInfoCircle } from 'react-icons/fa';
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
      try {
        const productosParseados: Producto[] = JSON.parse(datosGuardados);
        setListaProductos(productosParseados);
      } catch (error) {
        console.error("Error parsing products from localStorage", error);
        // Cargar datos de ejemplo si hay error o no hay datos
        setListaProductos(getSampleData());
      }
    } else {
      setListaProductos(getSampleData());
    }
  }, []);
  
  const getSampleData = (): Producto[] => [
    { id: 1, nombre: "Laptop Ultrabook Avanzada", descripcion: "Laptop ultraligera con procesador de última generación y pantalla OLED.", cantidad: 25, precioCompra: 950, precioVenta: 1450, proveedor: "Innovatech Solutions", img: "https://via.placeholder.com/150/0d6efd/FFFFFF?Text=Laptop", categoria: "Computadoras", sku: "LAP-ULTRA-001", fechaAgregado: new Date(2024,0,15).toISOString(), ultimaModificacion: new Date(2024,4,1).toISOString() },
    { id: 2, nombre: "Silla de Oficina Ergonómica Pro", descripcion: "Silla con múltiples ajustes y soporte lumbar dinámico para máximo confort.", cantidad: 40, precioCompra: 180, precioVenta: 299, proveedor: "ComfortZone Inc.", img: "https://via.placeholder.com/150/198754/FFFFFF?Text=SillaPro", categoria: "Mobiliario Oficina", sku: "CHA-ERG-PRO-002", fechaAgregado: new Date(2024,1,20).toISOString(), ultimaModificacion: new Date(2024,4,10).toISOString() },
    { id: 3, nombre: "Monitor Curvo Gaming 32\"", descripcion: "Monitor con alta tasa de refresco y resolución QHD para una experiencia inmersiva.", cantidad: 15, precioCompra: 350, precioVenta: 499, proveedor: "VisionX Displays", img: "https://via.placeholder.com/150/ffc107/000000?Text=Monitor", categoria: "Periféricos", sku: "MON-CURV-32G", fechaAgregado: new Date(2024,2,5).toISOString(), ultimaModificacion: new Date(2024,4,15).toISOString() },
  ];

  const productosFiltrados = useMemo(() => {
    if (!terminoBusqueda.trim()) return listaProductos;
    const lowerSearchTerm = terminoBusqueda.toLowerCase();
    return listaProductos.filter(p =>
      p.nombre.toLowerCase().includes(lowerSearchTerm) ||
      (p.proveedor && p.proveedor.toLowerCase().includes(lowerSearchTerm)) ||
      (p.categoria && p.categoria.toLowerCase().includes(lowerSearchTerm)) ||
      (p.sku && p.sku.toLowerCase().includes(lowerSearchTerm))
    );
  }, [listaProductos, terminoBusqueda]);

  const generarIdUnico = useCallback(() => {
    return listaProductos.length > 0 ? Math.max(...listaProductos.map(p => p.id)) + 1 : 1;
  }, [listaProductos]);

  const abrirModalParaAgregar = useCallback(() => {
    const newId = generarIdUnico();
    const currentDate = new Date().toISOString();
    setProductoActual({
      ...initialProductState,
      id: newId,
      fechaAgregado: currentDate,
      ultimaModificacion: currentDate,
    });
    setModoEdicion(false);
    setMostrarModal(true);
  }, [generarIdUnico]);

  const abrirModalParaEditar = useCallback((producto: Producto) => {
    setProductoActual({
      ...producto,
      ultimaModificacion: new Date().toISOString(),
    });
    setModoEdicion(true);
    setMostrarModal(true);
  }, []);

  const eliminarProducto = useCallback(() => {
    if (productoAEliminar) {
      const nuevaLista = listaProductos.filter(p => p.id !== productoAEliminar.id);
      setListaProductos(nuevaLista);
      editProd(nuevaLista); // Persistir cambios
      setProductoAEliminar(null);
      setMostrarConfirmacion(false);
    }
  }, [productoAEliminar, listaProductos]);

  const confirmarEliminacion = useCallback((producto: Producto) => {
    setProductoAEliminar(producto);
    setMostrarConfirmacion(true);
  }, []);

  const manejarCambio = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProductoActual(prev => ({
      ...prev,
      [name]: name === 'cantidad' || name.startsWith('precio') ? parseFloat(value) || 0 : value,
      ultimaModificacion: new Date().toISOString(),
    }));
  }, []);

  const manejarImagen = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductoActual(prev => ({ ...prev, img: reader.result, ultimaModificacion: new Date().toISOString() }));
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const guardarProducto = useCallback(() => {
    const productoFinal = {
      ...productoActual,
      ultimaModificacion: new Date().toISOString(),
      fechaAgregado: modoEdicion ? productoActual.fechaAgregado : new Date().toISOString()
    };

    let nuevaLista;
    if (modoEdicion) {
      nuevaLista = listaProductos.map(p => (p.id === productoFinal.id ? productoFinal : p));
    } else {
      nuevaLista = [...listaProductos, productoFinal];
    }
    setListaProductos(nuevaLista);
    editProd(nuevaLista); // Persistir cambios
    setMostrarModal(false);
  }, [productoActual, modoEdicion, listaProductos]);
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/D';

  const handleCloseModal = useCallback(() => setMostrarModal(false), []);
  const handleCloseConfirmacion = useCallback(() => setMostrarConfirmacion(false), []);

  return (
    <Container fluid className="py-4 px-xl-5 px-md-4 px-3 bg-body-tertiary inventory-page min-vh-100">
      <Card className="shadow-sm border-light">
        <Card.Header className="bg-dark text-white d-flex flex-wrap justify-content-between align-items-center py-3">
          <h2 className="mb-0 h5 d-flex align-items-center">
            <FaBoxOpen className="me-2" /> Gestión Avanzada de Inventario
          </h2>
          <Button onClick={() => navigate('/historial-salidas')} variant="outline-light" size="sm" className="mt-2 mt-md-0">
            <FaHistory className="me-1" /> Historial de Salidas
          </Button>
        </Card.Header>
        <Card.Body className="p-3 p-md-4">
          <Stack direction="horizontal" gap={3} className="mb-3 flex-wrap">
            <Button onClick={abrirModalParaAgregar} variant="primary" className="px-3">
              <FaPlus className="me-2" /> Nuevo Producto
            </Button>
            <InputGroup className="ms-md-auto" style={{ maxWidth: '450px' }}>
              <FormControl
                placeholder="Buscar producto (Nombre, SKU, Categoría, Proveedor)..."
                value={terminoBusqueda}
                onChange={(e) => setTerminoBusqueda(e.target.value)}
                className="border-end-0"
              />
              <InputGroup.Text className="bg-transparent border-start-0 text-primary">
                <FaSearch />
              </InputGroup.Text>
            </InputGroup>
          </Stack>

          {productosFiltrados.length > 0 ? (
            <div className="table-responsive">
              <Table striped bordered hover className="mt-2 inventory-table shadow-sm bg-white align-middle">
                <thead className="table-light text-uppercase small">
                  <tr>
                    <th style={{width: '4%'}}>#</th>
                    <th style={{width: '8%'}} className="text-center">Imagen</th>
                    <th>Producto (SKU)</th>
                    <th style={{width: '12%'}}>Categoría</th>
                    <th style={{width: '10%'}} className="text-center">Stock</th>
                    <th style={{width: '10%'}} className="text-end">P. Compra</th>
                    <th style={{width: '10%'}} className="text-end">P. Venta</th>
                    <th style={{width: '12%'}}>Proveedor</th>
                    <th style={{width: '10%'}} className="text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productosFiltrados.map((producto, index) => (
                    <tr key={producto.id}>
                      <td className="text-muted small">{producto.id}</td>
                      <td className="text-center p-2">
                        {producto.img ? (
                          <Image src={producto.img.toString()} alt={producto.nombre} className="inventory-img" />
                        ) : (
                          <div className="inventory-img-placeholder">
                             <FaImage size="1.8em" className="text-muted"/>
                          </div>
                        )}
                      </td>
                      <td>
                        <strong className="d-block">{producto.nombre}</strong>
                        <small className="text-muted">SKU: {producto.sku || 'N/D'}</small>
                      </td>
                      <td><Badge bg="secondary-subtle" text="dark" pill>{producto.categoria || 'Sin Categoría'}</Badge></td>
                      <td className="text-center">
                        <Badge bg={producto.cantidad <= 5 ? "danger-subtle" : producto.cantidad <= 15 ? "warning-subtle" : "success-subtle"} text="dark" className="fs-6 px-2">
                          {producto.cantidad}
                        </Badge>
                      </td>
                      <td className="text-end">{formatCurrency(producto.precioCompra)}</td>
                      <td className="text-end">{formatCurrency(producto.precioVenta)}</td>
                      <td>{producto.proveedor}</td>
                      <td className="text-center">
                        <ButtonGroup size="sm">
                          <Button variant="outline-primary" onClick={() => abrirModalParaEditar(producto)} title="Editar Producto">
                            <FaEdit />
                          </Button>
                          <Button variant="outline-danger" onClick={() => confirmarEliminacion(producto)} title="Eliminar Producto">
                            <FaTrash />
                          </Button>
                        </ButtonGroup>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ) : (
            <Alert variant="light" className="mt-4 text-center border p-4">
              <FaSearch size="2em" className="text-muted mb-2" />
              <h5 className="text-muted">No se encontraron productos</h5>
              <p className="mb-0 text-muted">
                {terminoBusqueda ? "Intenta con otros términos de búsqueda." : "Aún no hay productos en el inventario. ¡Agrega algunos!"}
              </p>
            </Alert>
          )}
        </Card.Body>
      </Card>

      <Modal show={mostrarModal} onHide={handleCloseModal} size="xl" backdrop="static" centered dialogClassName="modal-90w">
        <Modal.Header closeButton className={`${modoEdicion ? "bg-warning text-dark" : "bg-primary text-white"} border-0`}>
          <Modal.Title className="h5 d-flex align-items-center">
            {modoEdicion ? <FaEdit className="me-2" /> : <FaPlus className="me-2" />}
            {modoEdicion ? 'Editar Detalles del Producto' : 'Registrar Nuevo Producto en Inventario'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 bg-light">
          <Form>
            <Row>
              <Col md={8}>
                <Card className="mb-3 shadow-sm">
                  <Card.Body>
                  <h6 className="card-subtitle mb-3 text-muted"><FaInfoCircle className="me-1"/> Información Principal</h6>
                    <Row>
                      <Col md={8}>
                        <Form.Group controlId="nombre" className="mb-3">
                          <Form.Label className="small text-muted">Nombre del Producto</Form.Label>
                          <Form.Control type="text" name="nombre" value={productoActual.nombre} onChange={manejarCambio} placeholder="Ej: Laptop Gamer Pro" required />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="sku" className="mb-3">
                          <Form.Label className="small text-muted">SKU (Código)</Form.Label>
                          <Form.Control type="text" name="sku" value={productoActual.sku || ''} onChange={manejarCambio} placeholder="Ej: LAP-GAM-001"/>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group controlId="descripcion" className="mb-3">
                      <Form.Label className="small text-muted">Descripción Detallada</Form.Label>
                      <Form.Control as="textarea" rows={4} name="descripcion" value={productoActual.descripcion} onChange={manejarCambio} placeholder="Características, materiales, usos principales..." />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group controlId="categoria" className="mb-3">
                          <Form.Label className="small text-muted">Categoría</Form.Label>
                          <Form.Control type="text" name="categoria" value={productoActual.categoria || ''} onChange={manejarCambio} placeholder="Ej: Electrónicos, Ropa, Hogar"/>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="proveedor" className="mb-3">
                          <Form.Label className="small text-muted">Proveedor</Form.Label>
                          <Form.Control type="text" name="proveedor" value={productoActual.proveedor} onChange={manejarCambio} placeholder="Nombre de la empresa proveedora" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
                <Card className="shadow-sm">
                  <Card.Body>
                  <h6 className="card-subtitle mb-3 text-muted"><FaInfoCircle className="me-1"/> Precios y Stock</h6>
                    <Row>
                      <Col md={4}>
                        <Form.Group controlId="cantidad" className="mb-3">
                          <Form.Label className="small text-muted">Cantidad en Stock</Form.Label>
                          <Form.Control type="number" name="cantidad" value={productoActual.cantidad} onChange={manejarCambio} min="0" />
                        </Form.Group>
                      </Col>
                       <Col md={4}>
                        <Form.Group controlId="precioCompra" className="mb-3">
                          <Form.Label className="small text-muted">Precio de Compra (MXN)</Form.Label>
                          <Form.Control type="number" step="0.01" name="precioCompra" value={productoActual.precioCompra} onChange={manejarCambio} min="0" />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="precioVenta" className="mb-3">
                          <Form.Label className="small text-muted">Precio de Venta (MXN)</Form.Label>
                          <Form.Control type="number" step="0.01" name="precioVenta" value={productoActual.precioVenta} onChange={manejarCambio} min="0" />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={4}>
                <Card className="shadow-sm">
                  <Card.Body>
                  <h6 className="card-subtitle mb-3 text-muted"><FaImage className="me-1"/> Imagen del Producto</h6>
                    <Form.Group controlId="imagen" className="mb-3 image-upload-area">
                      <Form.Label className="image-upload-label w-100">
                        {productoActual.img ? (
                          <Image src={productoActual.img.toString()} alt="Vista previa" fluid thumbnail className="mb-2" />
                        ) : (
                          <div className="placeholder-icon text-center p-4 border rounded">
                            <FaUpload size="2em" className="text-primary mb-2" />
                            <p className="small text-muted mb-0">Clic o arrastra para subir imagen</p>
                          </div>
                        )}
                        <Form.Control type="file" accept="image/*" onChange={manejarImagen} className="d-none" />
                      </Form.Label>
                    </Form.Group>
                    <small className="text-muted d-block mt-3">
                      ID: <Badge bg="light" text="dark">{productoActual.id}</Badge><br/>
                      Agregado: {formatDate(productoActual.fechaAgregado)} <br/>
                      Últ. Mod.: {formatDate(productoActual.ultimaModificacion)}
                    </small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-body-tertiary border-top">
          <Button variant="outline-secondary" onClick={handleCloseModal}>
            <FaTimes className="me-1" /> Cancelar
          </Button>
          <Button variant={modoEdicion ? "warning" : "primary"} onClick={guardarProducto} className="px-4">
            <FaSave className="me-1" /> {modoEdicion ? 'Guardar Cambios' : 'Agregar Producto'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarConfirmacion} onHide={handleCloseConfirmacion} centered backdrop="static">
        <Modal.Header closeButton className="bg-danger text-white border-0">
          <Modal.Title className="h5 d-flex align-items-center"><FaExclamationTriangle className="me-2" /> Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p>¿Está absolutamente seguro de que desea eliminar el producto: <strong>{productoAEliminar?.nombre}</strong> (SKU: {productoAEliminar?.sku || 'N/D'})?</p>
          <Alert variant="warning" className="small p-2">
            <FaExclamationTriangle className="me-1"/> Esta acción es irreversible y el producto será eliminado permanentemente del inventario.
          </Alert>
        </Modal.Body>
        <Modal.Footer className="bg-body-tertiary border-top-0">
          <Button variant="secondary" onClick={handleCloseConfirmacion}>
            <FaTimes className="me-1" /> No, Cancelar
          </Button>
          <Button variant="danger" onClick={eliminarProducto}>
            <FaTrash className="me-1" /> Sí, Eliminar
          </Button>
        </Modal.Footer>
      </Modal>
      <style type="text/css">{`
        .inventory-page {
          // background-color: #eef2f7; // Un azul grisáceo muy claro
        }
        .inventory-table {
          font-size: 0.9rem;
        }
        .inventory-table th {
          // font-weight: 600;
          // color: #555;
        }
        .inventory-img {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 0.25rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .inventory-img:hover {
          transform: scale(1.25);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          z-index: 10;
        }
        .inventory-img-placeholder {
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #e9ecef; // Gris claro de Bootstrap
          border-radius: 0.25rem;
          border: 1px dashed #ced4da;
        }
        .image-upload-area .image-upload-label {
          cursor: pointer;
          display: block;
        }
        .image-upload-area .placeholder-icon {
          border: 2px dashed #0d6efd; /* Azul primario de Bootstrap */
          background-color: #f8f9fa; /* Gris muy claro */
          transition: background-color 0.2s ease;
        }
        .image-upload-area .placeholder-icon:hover {
          background-color: #e9ecef; /* Un poco más oscuro al pasar el mouse */
        }
        .modal-90w {
            max-width: 90vw !important;
        }
        .table-responsive {
            scrollbar-width: thin;
            scrollbar-color: #adb5bd #dee2e6;
        }
        .table-responsive::-webkit-scrollbar {
            height: 8px;
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
