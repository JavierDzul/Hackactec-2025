import React, { useState, useEffect, useMemo } from 'react';
import { Button, Modal, Form, Table, Container, Row, Col, Card, Image, InputGroup, Alert } from 'react-bootstrap';
import { FaPlusCircle, FaTrash, FaQrcode, FaShoppingCart, FaCashRegister, FaTimes, FaCheckCircle, FaSearch, FaDollarSign, FaInfoCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Interfaz Producto (compatible con la de InventarioPage)
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  cantidad: number; // Cantidad en stock
  precioCompra: number;
  precioVenta: number;
  proveedor: string;
  img: string | ArrayBuffer | null;
  categoria?: string;
  sku?: string;
  fechaAgregado?: string;
  ultimaModificacion?: string;
}

interface ProductoVendido extends Producto {
  cantidadVendida: number;
}

// Simulación de 'productos' (lista de productos disponibles del inventario)
// En una aplicación real, esto vendría de un estado global, API, o localStorage.
const simularProductosDisponibles = (): Producto[] => {
  const datosInventario = localStorage.getItem('productos');
  if (datosInventario) {
    return JSON.parse(datosInventario);
  }
  // Datos de ejemplo si no hay nada en localStorage
  return [
    { id: 1, nombre: "Laptop Pro X", descripcion: "Laptop de alto rendimiento", cantidad: 10, precioCompra: 800, precioVenta: 1200, proveedor: "TechCorp", img: "https://via.placeholder.com/150/007bff/FFFFFF?Text=Laptop", sku: "LPX-001", categoria: "Electrónicos" },
    { id: 2, nombre: "Silla Ergonómica Deluxe", descripcion: "Silla con soporte lumbar", cantidad: 25, precioCompra: 150, precioVenta: 250, proveedor: "OfficeComfort", img: "https://via.placeholder.com/150/28a745/FFFFFF?Text=Silla", sku: "SED-002", categoria: "Mobiliario" },
    { id: 3, nombre: "Monitor UltraWide 34\"", descripcion: "Monitor curvo para productividad", cantidad: 15, precioCompra: 300, precioVenta: 450, proveedor: "ViewMax", img: "https://via.placeholder.com/150/ffc107/000000?Text=Monitor", sku: "MUW-003", categoria: "Electrónicos" },
    { id: 4, nombre: "Teclado Mecánico RGB", descripcion: "Teclado para gaming y escritura", cantidad: 50, precioCompra: 60, precioVenta: 100, proveedor: "KeyMasters", img: "https://via.placeholder.com/150/6f42c1/FFFFFF?Text=Teclado", sku: "TMR-004", categoria: "Periféricos" },
  ];
};

const productosDisponiblesGlobal: Producto[] = simularProductosDisponibles();


export const VentasPage = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<string>('');
  const [cantidadVenta, setCantidadVenta] = useState<number>(1);
  const [productosEnVenta, setProductosEnVenta] = useState<ProductoVendido[]>([]);
  const [terminoBusquedaModal, setTerminoBusquedaModal] = useState('');

  const navigate = useNavigate();

  const productoSeleccionadoActual = useMemo(() => {
    return productosDisponiblesGlobal.find(p => p.id === parseInt(productoSeleccionadoId));
  }, [productoSeleccionadoId]);

  const productosFiltradosModal = useMemo(() => {
    if (!terminoBusquedaModal) return productosDisponiblesGlobal;
    return productosDisponiblesGlobal.filter(p =>
      p.nombre.toLowerCase().includes(terminoBusquedaModal.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(terminoBusquedaModal.toLowerCase())) ||
      (p.categoria && p.categoria.toLowerCase().includes(terminoBusquedaModal.toLowerCase()))
    );
  }, [terminoBusquedaModal]);


  const agregarProductoAVenta = () => {
    if (productoSeleccionadoActual && cantidadVenta > 0) {
      if (cantidadVenta > productoSeleccionadoActual.cantidad) {
        alert(`No hay suficiente stock para "${productoSeleccionadoActual.nombre}". Disponible: ${productoSeleccionadoActual.cantidad}.`);
        return;
      }

      const existenteIndex = productosEnVenta.findIndex(p => p.id === productoSeleccionadoActual.id);

      if (existenteIndex > -1) {
        const nuevaLista = [...productosEnVenta];
        const cantidadTotalNueva = nuevaLista[existenteIndex].cantidadVendida + cantidadVenta;
        if (cantidadTotalNueva > productoSeleccionadoActual.cantidad) {
          alert(`No hay suficiente stock para agregar más unidades de "${productoSeleccionadoActual.nombre}". Disponible: ${productoSeleccionadoActual.cantidad}, en carrito: ${nuevaLista[existenteIndex].cantidadVendida}.`);
          return;
        }
        nuevaLista[existenteIndex].cantidadVendida = cantidadTotalNueva;
        setProductosEnVenta(nuevaLista);
      } else {
        setProductosEnVenta(prev => [
          ...prev,
          { ...productoSeleccionadoActual, cantidadVendida: cantidadVenta }
        ]);
      }
      // Resetear para la próxima selección
      setProductoSeleccionadoId('');
      setCantidadVenta(1);
      setTerminoBusquedaModal(''); // Opcional: cerrar modal o resetear búsqueda
      // setMostrarModal(false); // No cerrar modal automáticamente para agregar más productos fácilmente
    }
  };

  const editarCantidadEnVenta = (id: number, nuevaCantidad: number) => {
    const productoInventario = productosDisponiblesGlobal.find(p => p.id === id);
    if (productoInventario && nuevaCantidad > productoInventario.cantidad) {
      alert(`Stock insuficiente. Máximo ${productoInventario.cantidad} unidades para "${productoInventario.nombre}".`);
      // Mantener la cantidad anterior o la máxima disponible
      const cantidadAnterior = productosEnVenta.find(p => p.id === id)?.cantidadVendida || productoInventario.cantidad;
      setProductosEnVenta(prev =>
        prev.map(p => (p.id === id ? { ...p, cantidadVendida: Math.min(cantidadAnterior, productoInventario.cantidad) } : p))
      );
      return;
    }

    setProductosEnVenta(prev =>
      prev.map(p => (p.id === id ? { ...p, cantidadVendida: Math.max(1, nuevaCantidad) } : p)) // Asegurar que la cantidad no sea menor a 1
    );
  };

  const eliminarProductoDeVenta = (id: number) => {
    setProductosEnVenta(prev => prev.filter(p => p.id !== id));
  };

  const calcularTotalVenta = () => {
    return productosEnVenta.reduce((sum, p) => sum + (p.precioVenta * p.cantidadVendida), 0);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  
  const handleAbrirModal = () => {
    setProductoSeleccionadoId('');
    setCantidadVenta(1);
    setTerminoBusquedaModal('');
    setMostrarModal(true);
  }

  return (
    <Container fluid className="pt-4 pb-0 d-flex flex-column sales-page-container bg-light">
      <Card className="shadow-lg border-0 flex-grow-1 d-flex flex-column overflow-hidden">
        <Card.Header className="bg-dark text-white py-3">
          <h2 className="mb-0 h4 d-flex align-items-center"><FaShoppingCart className="me-2" /> Punto de Venta</h2>
        </Card.Header>

        <Card.Body className="p-0 d-flex flex-column overflow-hidden">
          {productosEnVenta.length === 0 ? (
            <div className="d-flex flex-column justify-content-center align-items-center text-center p-5 flex-grow-1">
                <FaInfoCircle size="3em" className="text-muted mb-3"/>
                <h4>Venta Vacía</h4>
                <p className="text-muted">Aún no has agregado productos a esta venta. <br/> Haz clic en "Agregar Producto" para comenzar.</p>
            </div>
          ) : (
            <div className="table-responsive flex-grow-1" style={{maxHeight: 'calc(100vh - 280px)' /* Ajustar según altura de header/footer */}}>
              <Table striped hover className="sales-table mb-0">
                <thead className="table-secondary" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                  <tr>
                    <th style={{width: '80px'}}>Imagen</th>
                    <th>Producto (SKU)</th>
                    <th className="text-end">P. Unit.</th>
                    <th className="text-center" style={{width: '120px'}}>Cantidad</th>
                    <th className="text-end">Subtotal</th>
                    <th className="text-center" style={{width: '100px'}}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {productosEnVenta.map(producto => (
                    <tr key={producto.id} className="align-middle">
                      <td>
                        {producto.img ? (
                          <Image src={producto.img.toString()} alt={producto.nombre} width="60" height="60" style={{ objectFit: 'cover' }} rounded />
                        ) : (
                           <div className="text-muted" style={{width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f0f0', borderRadius: '.25rem'}}>
                             <FaShoppingCart size="1.5em"/>
                           </div>
                        )}
                      </td>
                      <td>
                        <strong>{producto.nombre}</strong>
                        <br />
                        <small className="text-muted">SKU: {producto.sku || 'N/A'}</small>
                      </td>
                      <td className="text-end">{formatCurrency(producto.precioVenta)}</td>
                      <td className="text-center">
                        <Form.Control
                          type="number"
                          min={1}
                          max={producto.cantidad} // Max stock
                          value={producto.cantidadVendida}
                          onChange={e => editarCantidadEnVenta(producto.id, parseInt(e.target.value))}
                          size="sm"
                          style={{ maxWidth: '80px', margin: 'auto' }}
                        />
                      </td>
                      <td className="text-end fw-bold">{formatCurrency(producto.precioVenta * producto.cantidadVendida)}</td>
                      <td className="text-center">
                        <Button variant="outline-danger" size="sm" onClick={() => eliminarProductoDeVenta(producto.id)} title="Eliminar de la venta">
                          <FaTrash />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>

        <Card.Footer className="bg-white border-top py-3 px-4">
          <Row className="align-items-center">
            <Col md={6} className="d-flex gap-2 mb-2 mb-md-0">
              <Button size="lg" variant="primary" onClick={handleAbrirModal} className="flex-grow-1 flex-md-grow-0">
                <FaPlusCircle className="me-2" /> Agregar Producto
              </Button>
              <Button size="lg" variant="outline-secondary" className="flex-grow-1 flex-md-grow-0">
                <FaQrcode className="me-2" /> Escanear QR
              </Button>
            </Col>
            <Col md={6} className="text-md-end">
              <div className="mb-2">
                <h4 className="mb-0">Total: <span className="text-success fw-bold">{formatCurrency(calcularTotalVenta())}</span></h4>
              </div>
              <Button
                size="lg"
                variant="success"
                disabled={productosEnVenta.length === 0}
                onClick={() => navigate('/detalle-venta', { state: { productos: productosEnVenta, total: calcularTotalVenta() } })}
                className="w-100 w-md-auto"
              >
                <FaCashRegister className="me-2" /> Proceder al Pago
              </Button>
            </Col>
          </Row>
        </Card.Footer>
      </Card>

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="xl" centered backdrop="static">
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="h5"><FaPlusCircle className="me-2" />Añadir Producto a la Venta</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{minHeight: '60vh'}}>
          <Row>
            <Col md={8}>
              <InputGroup className="mb-3">
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  placeholder="Buscar producto por nombre, SKU o categoría..."
                  value={terminoBusquedaModal}
                  onChange={(e) => setTerminoBusquedaModal(e.target.value)}
                />
              </InputGroup>
              <div className="product-list-modal overflow-auto" style={{maxHeight: 'calc(60vh - 120px)'}}>
                {productosFiltradosModal.length > 0 ? (
                  <Table hover responsive="sm" size="sm">
                    <thead className="table-light">
                      <tr>
                        <th></th>
                        <th>Producto</th>
                        <th>Categoría</th>
                        <th className="text-end">Precio</th>
                        <th className="text-center">Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                    {productosFiltradosModal.map(p => (
                      <tr key={p.id} onClick={() => setProductoSeleccionadoId(p.id.toString())} className={productoSeleccionadoId === p.id.toString() ? 'table-active' : ''} style={{cursor: 'pointer'}}>
                        <td className="text-center">
                           <Form.Check type="radio" name="productoSeleccionadoRadio" value={p.id} checked={productoSeleccionadoId === p.id.toString()} onChange={(e) => setProductoSeleccionadoId(e.target.value)} />
                        </td>
                        <td>
                          {p.img && <Image src={p.img.toString()} width="40" height="40" style={{objectFit: 'cover', marginRight: '10px'}} rounded />}
                          {p.nombre} <small className="text-muted">({p.sku || 'N/A'})</small>
                        </td>
                        <td>{p.categoria || 'N/A'}</td>
                        <td className="text-end">{formatCurrency(p.precioVenta)}</td>
                        <td className={`text-center fw-bold ${p.cantidad <= 5 ? 'text-danger' : p.cantidad <=10 ? 'text-warning' : 'text-success'}`}>{p.cantidad}</td>
                      </tr>
                    ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="light" className="text-center mt-3">No se encontraron productos con ese criterio.</Alert>
                )}
              </div>
            </Col>
            <Col md={4} className="border-start ps-md-4">
              <h5 className="mb-3">Detalles del Producto Seleccionado</h5>
              {productoSeleccionadoActual ? (
                <>
                  <div className="text-center mb-3">
                  {productoSeleccionadoActual.img && (
                    <Image src={productoSeleccionadoActual.img.toString()} alt={productoSeleccionadoActual.nombre} style={{ maxHeight: '150px', objectFit: 'contain' }} fluid rounded />
                  )}
                  </div>
                  <h6>{productoSeleccionadoActual.nombre}</h6>
                  <p className="small text-muted mb-1">{productoSeleccionadoActual.descripcion}</p>
                  <p className="mb-1"><strong>Precio:</strong> {formatCurrency(productoSeleccionadoActual.precioVenta)}</p>
                  <p className="mb-1"><strong>Stock Disponible:</strong> <span className={`fw-bold ${productoSeleccionadoActual.cantidad <= 5 ? 'text-danger' : productoSeleccionadoActual.cantidad <=10 ? 'text-warning' : 'text-success'}`}>{productoSeleccionadoActual.cantidad}</span></p>
                  <Form.Group className="mt-3">
                    <Form.Label className="fw-semibold">Cantidad a Vender:</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      max={productoSeleccionadoActual.cantidad}
                      value={cantidadVenta}
                      onChange={e => setCantidadVenta(Math.max(1, parseInt(e.target.value)))}
                      isInvalid={cantidadVenta > productoSeleccionadoActual.cantidad}
                      required
                    />
                     <Form.Control.Feedback type="invalid">
                        La cantidad no puede exceder el stock disponible ({productoSeleccionadoActual.cantidad}).
                    </Form.Control.Feedback>
                  </Form.Group>
                </>
              ) : (
                <p className="text-muted">Seleccione un producto de la lista.</p>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="outline-secondary" onClick={() => setMostrarModal(false)}>
            <FaTimes className="me-1" /> Cerrar
          </Button>
          <Button
            variant="success"
            onClick={agregarProductoAVenta}
            disabled={!productoSeleccionadoActual || cantidadVenta <= 0 || cantidadVenta > (productoSeleccionadoActual?.cantidad || 0)}
          >
            <FaCheckCircle className="me-1" /> Agregar a Venta
          </Button>
        </Modal.Footer>
      </Modal>
      <style type="text/css">{`
        .sales-page-container { height: 100vh; }
        .sales-table th, .sales-table td { vertical-align: middle; }
        .product-list-modal tr:hover { background-color: #f0f8ff; }
        .form-control:disabled, .form-control[readonly] { background-color: #e9ecef; opacity: 1; }
        .table-active { background-color: #cfe2ff !important; } /* Bootstrap's active table color */
        .modal-body { padding-bottom: 0; } /* Para ajustar el scroll mejor */
      `}</style>
    </Container>
  );
};