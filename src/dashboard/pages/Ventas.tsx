import React, { useState, useEffect, useMemo } from 'react';
import { Button, Modal, Form, Table, Container, Row, Col, Card, Image, InputGroup, Alert, Badge, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { 
    FaPlusCircle, FaTrash, FaQrcode, FaShoppingCart, FaCashRegister, FaTimes, FaCheckCircle, 
    FaSearch, FaDollarSign, FaInfoCircle, FaUserTag, FaTags, FaCalendarPlus, FaBoxes 
} from 'react-icons/fa';
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
  // Podríamos añadir aquí campos específicos de la venta si fuera necesario, como descuento aplicado a este item.
  descuentoItem?: number; // Porcentaje o monto
}

// Simulación de 'productos' (lista de productos disponibles del inventario)
const simularProductosDisponibles = (): Producto[] => {
  const datosInventario = localStorage.getItem('productos');
  if (datosInventario) {
    return JSON.parse(datosInventario);
  }
  return [
    { id: 1, nombre: "Laptop Pro X", descripcion: "Laptop de alto rendimiento", cantidad: 10, precioCompra: 800, precioVenta: 1200, proveedor: "TechCorp", img: "https://via.placeholder.com/150/007bff/FFFFFF?Text=Laptop", sku: "LPX-001", categoria: "Electrónicos", fechaAgregado: "2025-01-15T10:00:00Z" },
    { id: 2, nombre: "Silla Ergonómica Deluxe", descripcion: "Silla con soporte lumbar", cantidad: 25, precioCompra: 150, precioVenta: 250, proveedor: "OfficeComfort", img: "https://via.placeholder.com/150/28a745/FFFFFF?Text=Silla", sku: "SED-002", categoria: "Mobiliario", fechaAgregado: "2025-02-20T11:30:00Z" },
    { id: 3, nombre: "Monitor UltraWide 34\"", descripcion: "Monitor curvo para productividad", cantidad: 15, precioCompra: 300, precioVenta: 450, proveedor: "ViewMax", img: "https://via.placeholder.com/150/ffc107/000000?Text=Monitor", sku: "MUW-003", categoria: "Electrónicos", fechaAgregado: "2025-03-10T09:15:00Z" },
    { id: 4, nombre: "Teclado Mecánico RGB", descripcion: "Teclado para gaming y escritura", cantidad: 5, precioCompra: 60, precioVenta: 100, proveedor: "KeyMasters", img: "https://via.placeholder.com/150/6f42c1/FFFFFF?Text=Teclado", sku: "TMR-004", categoria: "Periféricos", fechaAgregado: "2025-04-05T14:00:00Z" },
    { id: 5, nombre: "Mouse Inalámbrico Ergo", descripcion: "Mouse vertical para mayor comodidad", cantidad: 0, precioCompra: 25, precioVenta: 45, proveedor: "LogiComfort", img: "https://via.placeholder.com/150/fd7e14/FFFFFF?Text=Mouse", sku: "MIE-005", categoria: "Periféricos", fechaAgregado: "2025-05-01T16:00:00Z" },
  ];
};

const productosDisponiblesGlobal: Producto[] = simularProductosDisponibles();


export const VentasPage = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<string>('');
  const [cantidadVenta, setCantidadVenta] = useState<number>(1);
  const [productosEnVenta, setProductosEnVenta] = useState<ProductoVendido[]>([]);
  const [terminoBusquedaModal, setTerminoBusquedaModal] = useState('');
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>(''); // Conceptual

  const navigate = useNavigate();
  const FECHA_ACTUAL_UTC = "2025-05-22 08:14:28"; // UTC Date from prompt

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
  }, [terminoBusquedaModal, productosDisponiblesGlobal]);


  const agregarProductoAVenta = () => {
    if (productoSeleccionadoActual && cantidadVenta > 0) {
      if (productoSeleccionadoActual.cantidad === 0) {
        alert(`"${productoSeleccionadoActual.nombre}" está agotado y no se puede agregar a la venta.`);
        return;
      }
      if (cantidadVenta > productoSeleccionadoActual.cantidad) {
        alert(`No hay suficiente stock para "${productoSeleccionadoActual.nombre}". Disponible: ${productoSeleccionadoActual.cantidad}. Solicitado: ${cantidadVenta}`);
        setCantidadVenta(productoSeleccionadoActual.cantidad); // Ajustar a max disponible
        return;
      }

      const existenteIndex = productosEnVenta.findIndex(p => p.id === productoSeleccionadoActual.id);

      if (existenteIndex > -1) {
        const nuevaLista = [...productosEnVenta];
        const cantidadTotalNueva = nuevaLista[existenteIndex].cantidadVendida + cantidadVenta;
        if (cantidadTotalNueva > productoSeleccionadoActual.cantidad) {
          alert(`No hay suficiente stock para agregar más unidades de "${productoSeleccionadoActual.nombre}". Disponible: ${productoSeleccionadoActual.cantidad}, en carrito: ${nuevaLista[existenteIndex].cantidadVendida}. Solicitado agregar: ${cantidadVenta}`);
          return;
        }
        nuevaLista[existenteIndex].cantidadVendida = cantidadTotalNueva;
        setProductosEnVenta(nuevaLista);
      } else {
        setProductosEnVenta(prev => [
          ...prev,
          { ...productoSeleccionadoActual, cantidadVendida: cantidadVenta, descuentoItem: 0 } // Añadido descuentoItem conceptual
        ]);
      }
      setProductoSeleccionadoId('');
      setCantidadVenta(1);
      // No resetear término de búsqueda para facilitar búsquedas similares
    }
  };

  const editarCantidadEnVenta = (id: number, nuevaCantidadStr: string) => {
    const nuevaCantidad = parseInt(nuevaCantidadStr);
    if (isNaN(nuevaCantidad) || nuevaCantidad < 0) return; // Ignorar si no es un número válido o es negativo

    const productoInventario = productosDisponiblesGlobal.find(p => p.id === id);
    if (productoInventario && nuevaCantidad > productoInventario.cantidad) {
      alert(`Stock insuficiente. Máximo ${productoInventario.cantidad} unidades para "${productoInventario.nombre}".`);
      setProductosEnVenta(prev =>
        prev.map(p => (p.id === id ? { ...p, cantidadVendida: productoInventario.cantidad } : p))
      );
      return;
    }

    setProductosEnVenta(prev =>
      prev.map(p => (p.id === id ? { ...p, cantidadVendida: nuevaCantidad === 0 ? 0 : Math.max(0, nuevaCantidad) } : p)) // Permitir 0 para luego eliminar si es necesario
    );
  };
  
  const handleBlurCantidad = (id: number, cantidadActual: number) => {
      if (cantidadActual === 0) {
          eliminarProductoDeVenta(id);
      }
  }

  const eliminarProductoDeVenta = (id: number) => {
    setProductosEnVenta(prev => prev.filter(p => p.id !== id));
  };

  const calcularSubtotalItem = (item: ProductoVendido) => {
    const precioConDescuento = item.precioVenta * (1 - (item.descuentoItem || 0) / 100);
    return precioConDescuento * item.cantidadVendida;
  }

  const calcularTotalVenta = () => {
    return productosEnVenta.reduce((sum, p) => sum + calcularSubtotalItem(p), 0);
  };
  
  const totalItemsEnVenta = useMemo(() => {
    return productosEnVenta.reduce((sum, p) => sum + p.cantidadVendida, 0);
  }, [productosEnVenta]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  const formatDate = (dateString?: string) => dateString ? new Date(dateString).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric'}) : 'N/A';
  
  const handleAbrirModal = () => {
    setProductoSeleccionadoId('');
    setCantidadVenta(1);
    // Mantener término de búsqueda modal si el usuario quiere seguir buscando algo similar
    setMostrarModal(true);
  }

  return (
    <Container fluid className="pt-4 pb-0 d-flex flex-column sales-page-container bg-light">
      <Card className="shadow-lg border-0 flex-grow-1 d-flex flex-column overflow-hidden">
        <Card.Header className="bg-dark text-white py-3 px-4 d-flex justify-content-between align-items-center">
          <h2 className="mb-0 h4 d-flex align-items-center"><FaShoppingCart className="me-2" /> Punto de Venta</h2>
          <small className="text-light">Fecha: {new Date(FECHA_ACTUAL_UTC).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</small>
        </Card.Header>

        <Card.Body className="p-0 d-flex flex-column overflow-hidden">
          {productosEnVenta.length === 0 ? (
            <div className="d-flex flex-column justify-content-center align-items-center text-center p-5 flex-grow-1 bg-white">
                <FaInfoCircle size="3.5em" className="text-primary mb-3"/>
                <h4 className="text-dark">Iniciar una Nueva Venta</h4>
                <p className="text-muted px-md-5">Agregue productos al carrito para comenzar. Puede buscar o escanear productos para una gestión rápida y eficiente.</p>
                <Button size="lg" variant="primary" onClick={handleAbrirModal} className="mt-2">
                    <FaPlusCircle className="me-2" /> Agregar Primer Producto
                </Button>
            </div>
          ) : (
            <div className="table-responsive flex-grow-1" style={{maxHeight: 'calc(100vh - 300px)' /* Ajustar dinámicamente */}}>
              <Table striped hover className="sales-table mb-0">
                <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 2px -1px rgba(0,0,0,.1)' }}>
                  <tr>
                    <th style={{width: '70px'}}>Imagen</th>
                    <th>Producto (SKU)</th>
                    <th className="text-end">P. Unit.</th>
                    {/* Conceptual: <th className="text-center">Desc.%</th> */}
                    <th className="text-center" style={{width: '110px'}}>Cantidad</th>
                    <th className="text-end">Subtotal</th>
                    <th className="text-center" style={{width: '80px'}}>Quitar</th>
                  </tr>
                </thead>
                <tbody>
                  {productosEnVenta.map(producto => (
                    <tr key={producto.id} className="align-middle">
                      <td className="py-2">
                        {producto.img ? (
                          <Image src={producto.img.toString()} alt={producto.nombre} width="55" height="55" style={{ objectFit: 'cover' }} rounded />
                        ) : (
                           <div className="text-muted d-flex align-items-center justify-content-center bg-light rounded" style={{width: 55, height: 55}}>
                             <FaBoxes size="1.5em"/>
                           </div>
                        )}
                      </td>
                      <td>
                        <strong className="d-block">{producto.nombre}</strong>
                        <small className="text-muted">SKU: {producto.sku || 'N/A'} <FaTags size="0.8em" className="ms-1 text-info" title={`Categoría: ${producto.categoria || 'N/A'}`}/></small>
                      </td>
                      <td className="text-end">{formatCurrency(producto.precioVenta)}</td>
                      {/* Conceptual: <td className="text-center">
                        <Form.Control type="number" size="sm" defaultValue={producto.descuentoItem || 0} style={{maxWidth: '60px', margin: 'auto'}}/>
                      </td> */}
                      <td className="text-center">
                        <Form.Control
                          type="number"
                          min={0} // Permitir 0 para luego eliminar con onBlur
                          max={producto.cantidad + producto.cantidadVendida} // Stock original + lo que ya está en carrito
                          value={producto.cantidadVendida}
                          onChange={e => editarCantidadEnVenta(producto.id, e.target.value)}
                          onBlur={e => handleBlurCantidad(producto.id, parseInt(e.target.value))}
                          size="sm"
                          className="text-center"
                          style={{ maxWidth: '70px', margin: 'auto' }}
                        />
                      </td>
                      <td className="text-end fw-bold">{formatCurrency(calcularSubtotalItem(producto))}</td>
                      <td className="text-center">
                        <OverlayTrigger placement="top" overlay={<Tooltip id={`tooltip-delete-${producto.id}`}>Eliminar de la venta</Tooltip>}>
                          <Button variant="link" className="text-danger p-0" size="sm" onClick={() => eliminarProductoDeVenta(producto.id)}>
                            <FaTrash size="1.2em"/>
                          </Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card.Body>

        <Card.Footer className="bg-white border-top py-3 px-4 shadow-sm">
            <Row className="align-items-center gy-2">
                <Col lg={5} md={12} className="d-flex gap-2 mb-2 mb-lg-0">
                    <Button size="lg" variant="primary" onClick={handleAbrirModal} className="flex-grow-1">
                        <FaPlusCircle className="me-2" /> Agregar
                    </Button>
                    <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-qr">Escanear código de barras o QR</Tooltip>}>
                        <Button size="lg" variant="outline-secondary" className="flex-grow-1">
                            <FaQrcode className="me-md-2" /> <span className="d-none d-md-inline">Escanear</span>
                        </Button>
                    </OverlayTrigger>
                     <OverlayTrigger placement="top" overlay={<Tooltip id="tooltip-cliente">Asignar cliente a la venta (Próximamente)</Tooltip>}>
                        <Button size="lg" variant="outline-info" className="flex-grow-1" disabled>
                            <FaUserTag className="me-md-2" /> <span className="d-none d-md-inline">Cliente</span>
                        </Button>
                    </OverlayTrigger>
                </Col>
                <Col lg={7} md={12} className="text-lg-end">
                    <Row className="align-items-center">
                        <Col sm={6} xs={12} className="mb-2 mb-sm-0 text-start text-sm-end">
                            <span className="text-muted me-2">Items: <strong className="text-dark">{totalItemsEnVenta}</strong> ({productosEnVenta.length} tipos)</span>
                            <h3 className="mb-0 d-inline-block">Total: <strong className="text-success">{formatCurrency(calcularTotalVenta())}</strong></h3>
                        </Col>
                        <Col sm={6} xs={12}>
                            <Button
                                size="lg"
                                variant="success"
                                disabled={productosEnVenta.length === 0}
                                onClick={() => navigate('/detalle-venta', { state: { productos: productosEnVenta, total: calcularTotalVenta(), cliente: clienteSeleccionado } })}
                                className="w-100 py-2" // Botón más alto
                            >
                                <FaCashRegister className="me-2" /> Proceder al Pago
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </Card.Footer>
      </Card>

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="xl" centered backdrop="static" scrollable>
        <Modal.Header closeButton className="bg-primary text-white py-2">
          <Modal.Title className="h5"><FaSearch className="me-2" />Buscar y Añadir Productos</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{minHeight: '65vh', maxHeight: '65vh'}} className="p-4">
          <Row>
            <Col md={7} className="border-end pe-md-4">
              <InputGroup className="mb-3 shadow-sm">
                <Form.Control
                  placeholder="Buscar por nombre, SKU, categoría..."
                  value={terminoBusquedaModal}
                  onChange={(e) => setTerminoBusquedaModal(e.target.value)}
                  size="lg"
                  autoFocus
                />
                {terminoBusquedaModal && (
                    <Button variant="outline-secondary" onClick={() => setTerminoBusquedaModal('')}><FaTimes/></Button>
                )}
              </InputGroup>
              <div className="product-list-modal overflow-auto" style={{maxHeight: 'calc(65vh - 100px)'}}>
                {productosFiltradosModal.length > 0 ? (
                  <Table hover responsive="sm" size="sm" className="border-top">
                    <thead className="table-light">
                      <tr>
                        <th style={{width:'5%'}}></th>
                        <th style={{width:'45%'}}>Producto</th>
                        <th style={{width:'20%'}}>Categoría</th>
                        <th className="text-end" style={{width:'15%'}}>Precio</th>
                        <th className="text-center" style={{width:'15%'}}>Stock</th>
                      </tr>
                    </thead>
                    <tbody>
                    {productosFiltradosModal.map(p => (
                      <tr key={p.id} onClick={() => { if(p.cantidad > 0) setProductoSeleccionadoId(p.id.toString())}} className={`${productoSeleccionadoId === p.id.toString() ? 'table-info' : ''} ${p.cantidad === 0 ? 'table-light text-muted' : ''}`} style={{cursor: p.cantidad > 0 ? 'pointer' : 'not-allowed'}} title={p.cantidad === 0 ? 'Producto agotado' : p.nombre}>
                        <td className="text-center align-middle">
                           <Form.Check type="radio" name="productoSeleccionadoRadio" value={p.id} checked={productoSeleccionadoId === p.id.toString()} onChange={(e) => setProductoSeleccionadoId(e.target.value)} disabled={p.cantidad === 0} />
                        </td>
                        <td className="align-middle">
                          {p.img && <Image src={p.img.toString()} width="45" height="45" style={{objectFit: 'cover', marginRight: '12px'}} rounded />}
                          <span className="fw-medium">{p.nombre}</span> <br/><small className="text-muted">SKU: {p.sku || 'N/A'}</small>
                        </td>
                        <td className="align-middle"><Badge bg="secondary" pill>{p.categoria || 'N/A'}</Badge></td>
                        <td className="text-end align-middle">{formatCurrency(p.precioVenta)}</td>
                        <td className={`text-center align-middle fw-bold ${p.cantidad === 0 ? 'text-danger' : p.cantidad <= 5 ? 'text-warning' : 'text-success'}`}>{p.cantidad}</td>
                      </tr>
                    ))}
                    </tbody>
                  </Table>
                ) : (
                  <Alert variant="secondary" className="text-center mt-3 py-4">
                    <FaInfoCircle size="2em" className="mb-2"/> <br/>
                    No se encontraron productos que coincidan con su búsqueda. <br/>
                    Intente con otros términos o verifique el inventario.
                  </Alert>
                )}
              </div>
            </Col>
            <Col md={5} className="ps-md-4 d-flex flex-column">
              <h5 className="mb-3 pt-3 pt-md-0">Detalles del Producto Seleccionado</h5>
              {productoSeleccionadoActual ? (
                <Card className="flex-grow-1 shadow-sm">
                  <Card.Body className="d-flex flex-column">
                    <div className="text-center mb-3">
                    {productoSeleccionadoActual.img && (
                      <Image src={productoSeleccionadoActual.img.toString()} alt={productoSeleccionadoActual.nombre} style={{ maxHeight: '180px', objectFit: 'contain' }} fluid rounded />
                    )}
                    </div>
                    <h6 className="fw-bold">{productoSeleccionadoActual.nombre}</h6>
                    <p className="small text-muted mb-2 flex-grow-1" style={{minHeight: '60px'}}>{productoSeleccionadoActual.descripcion}</p>
                    <Table borderless size="sm" className="mb-2 small">
                        <tbody>
                            <tr><td><strong>SKU:</strong></td><td>{productoSeleccionadoActual.sku || 'N/A'}</td></tr>
                            <tr><td><strong>Categoría:</strong></td><td>{productoSeleccionadoActual.categoria || 'N/A'}</td></tr>
                            <tr><td><strong>Proveedor:</strong></td><td>{productoSeleccionadoActual.proveedor || 'N/A'}</td></tr>
                            <tr><td><strong>Precio Venta:</strong></td><td className="fw-bold text-success">{formatCurrency(productoSeleccionadoActual.precioVenta)}</td></tr>
                            <tr><td><strong>Stock Actual:</strong></td><td><span className={`fw-bold ${productoSeleccionadoActual.cantidad === 0 ? 'text-danger' : productoSeleccionadoActual.cantidad <= 5 ? 'text-warning' : 'text-success'}`}>{productoSeleccionadoActual.cantidad} unidades</span></td></tr>
                            <tr><td><strong>Agregado el:</strong></td><td>{formatDate(productoSeleccionadoActual.fechaAgregado)}</td></tr>
                        </tbody>
                    </Table>
                    <Form.Group className="mt-auto">
                      <Form.Label className="fw-semibold mb-1">Cantidad a Vender:</Form.Label>
                      <Form.Control
                        type="number"
                        min={1}
                        max={productoSeleccionadoActual.cantidad}
                        value={cantidadVenta}
                        onChange={e => setCantidadVenta(Math.max(1, parseInt(e.target.value)))}
                        isInvalid={cantidadVenta > productoSeleccionadoActual.cantidad || productoSeleccionadoActual.cantidad === 0}
                        disabled={productoSeleccionadoActual.cantidad === 0}
                        required
                        size="lg"
                      />
                       <Form.Control.Feedback type="invalid">
                          {productoSeleccionadoActual.cantidad === 0 ? "Producto agotado." : `Cantidad no puede exceder stock (${productoSeleccionadoActual.cantidad}).`}
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Card.Body>
                </Card>
              ) : (
                <Alert variant="light" className="text-center flex-grow-1 d-flex align-items-center justify-content-center">
                    <div>
                        <FaInfoCircle size="2em" className="text-muted mb-2"/> <br/>
                        Seleccione un producto de la lista para ver sus detalles y añadirlo a la venta.
                    </div>
                </Alert>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="bg-light border-top py-2">
          <Button variant="outline-secondary" onClick={() => setMostrarModal(false)} size="lg">
            <FaTimes className="me-1" /> Cerrar
          </Button>
          <Button
            variant="success"
            onClick={agregarProductoAVenta}
            disabled={!productoSeleccionadoActual || cantidadVenta <= 0 || cantidadVenta > (productoSeleccionadoActual?.cantidad || 0) || productoSeleccionadoActual.cantidad === 0}
            size="lg"
          >
            <FaCheckCircle className="me-1" /> Agregar a Venta
          </Button>
        </Modal.Footer>
      </Modal>
      <style type="text/css">{`
        .sales-page-container { height: 100vh; font-family: 'Inter', sans-serif; }
        .sales-table th, .sales-table td { vertical-align: middle; font-size: 0.9rem; }
        .sales-table thead th { font-weight: 600; background-color: #e9ecef !important; }
        .product-list-modal tr:hover:not(.table-light) { background-color: #e6f2ff; } /* Hover más sutil */
        .table-info { background-color: #cfe2ff !important; font-weight: 500; }
        .table-light.text-muted { cursor: not-allowed !important; }
        .form-control:disabled, .form-control[readonly] { background-color: #f8f9fa; opacity: 0.8; }
        .modal-body { padding-bottom: 1rem; }
        .fw-medium { font-weight: 500 !important; }
        .btn-link.text-danger:hover { color: #a71d2a !important; }
        .shadow-sm { box-shadow: 0 .125rem .25rem rgba(0,0,0,.075)!important; }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
    </Container>
  );
};
