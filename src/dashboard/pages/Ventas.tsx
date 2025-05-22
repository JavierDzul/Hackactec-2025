import { useState } from 'react';
import { Button, Modal, Form, Table, Container, Row, Col } from 'react-bootstrap';
import { productos } from '../NavBar';  // Asegúrate de exportar Producto y productos
import type { Producto } from './Inventario';
import { useNavigate } from 'react-router-dom';


interface ProductoVendido extends Producto {
  cantidadVendida: number;
}



export const VentasPage = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
  const [cantidad, setCantidad] = useState<number>(1);
  const [productosVendidos, setProductosVendidos] = useState<ProductoVendido[]>([]);

  const navigate = useNavigate();

  const agregarProductoAVenta = () => {
    if (productoSeleccionado && cantidad > 0) {
      const yaAgregado = productosVendidos.find(p => p.id === productoSeleccionado.id);
      if (yaAgregado) {
        // Si ya está en la venta, sumamos la cantidad
        yaAgregado.cantidadVendida += cantidad;
        setProductosVendidos([...productosVendidos]);
      } else {
        setProductosVendidos([
          ...productosVendidos,
          { ...productoSeleccionado, cantidadVendida: cantidad }
        ]);
      }
      setProductoSeleccionado(null);
      setCantidad(1);
      setMostrarModal(false);
    }
  };

  const editarCantidad = (id: number, nuevaCantidad: number) => {
    setProductosVendidos(prev =>
      prev.map(p => (p.id === id ? { ...p, cantidadVendida: nuevaCantidad } : p))
    );
  };

  const eliminarProducto = (id: number) => {
    setProductosVendidos(prev => prev.filter(p => p.id !== id));
  };

  return (
    <Container fluid className="d-flex flex-column" style={{ height: 'calc(100vh - 60px)', overflow: 'hidden' }}>

      <Row className="flex-grow-1 overflow-auto p-4">

        <Col>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Nombre</th>
                <th>Precio Venta</th>
                <th>Cantidad</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productosVendidos.map(producto => (
                <tr key={producto.id}>
                  <td>
                    {producto.img && (
                      <img
                        src={producto.img.toString()}
                        alt={producto.nombre}
                        width="60"
                        height="60"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                  </td>
                  <td>{producto.nombre}</td>
                  <td>${producto.precioVenta.toFixed(2)}</td>
                  <td>
                    <Form.Control
                      type="number"
                      min={1}
                      value={producto.cantidadVendida}
                      onChange={e =>
                        editarCantidad(producto.id, parseInt(e.target.value) || 1)
                      }
                      style={{ maxWidth: '80px' }}
                    />
                  </td>
                  <td>
                    ${(producto.precioVenta * producto.cantidadVendida).toFixed(2)}
                  </td>
                  <td>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => eliminarProducto(producto.id)}
                    >
                      Eliminar
                    </Button>
                  </td>
                </tr>
              ))}
              {productosVendidos.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center">
                    No hay productos en esta venta.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>

      {/* Botón fijo abajo */}
      <Row className="bg-light py-3 px-4 border-top justify-content-between align-items-center">
  <Col xs="auto" className="d-flex gap-2">
    <Button size="lg" variant="primary" onClick={() => setMostrarModal(true)}>
      Agregar producto
    </Button>
    <Button size="lg" variant="secondary">
      QR
    </Button>
  </Col>

  <Col xs="auto">
    <Button
        size="lg"
        variant="success"
        disabled={productosVendidos.length === 0}
        onClick={() => navigate('/detalle-venta', { state: { productos: productosVendidos } })}
        >
        Realizar venta
    </Button>
  </Col>
</Row>

      {/* Modal para agregar producto */}
      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Agregar producto a la venta</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Seleccionar producto</Form.Label>
              <Form.Select
                onChange={e => {
                  const prod = productos.find(p => p.id === parseInt(e.target.value));
                  setProductoSeleccionado(prod || null);
                }}
                defaultValue=""
              >
                <option value="" disabled>
                  -- Elige un producto --
                </option>
                {productos.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={cantidad}
                onChange={e => setCantidad(parseInt(e.target.value) || 1)}
              />
            </Form.Group>

            {productoSeleccionado && (
              <div className="mt-4 d-flex align-items-center">
                {productoSeleccionado.img && (
                  <img
                    src={productoSeleccionado.img.toString()}
                    alt={productoSeleccionado.nombre}
                    width="100"
                    height="100"
                    className="me-3"
                    style={{ objectFit: 'cover' }}
                  />
                )}
                <div>
                  <h5>{productoSeleccionado.nombre}</h5>
                  <p className="mb-1">
                    <strong>Precio venta:</strong> ${productoSeleccionado.precioVenta.toFixed(2)}
                  </p>
                  <p className="mb-0">{productoSeleccionado.descripcion}</p>
                </div>
              </div>
            )}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={agregarProductoAVenta}
            disabled={!productoSeleccionado}
          >
            Seleccionar
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};
