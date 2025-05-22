import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { editProd } from '../NavBar';
import { useNavigate } from 'react-router-dom';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
  proveedor: string
  img: string | ArrayBuffer | null;
}

export const InventarioPage = () => {

  const navigate = useNavigate();

  const [listaProductos, setListaProductos] = useState<Producto[]>([{
  id: 0,
  nombre: "string",
  descripcion: "string",
  cantidad: 1,
  precioCompra: 1,
  precioVenta: 1,
  proveedor: "string",
  img: "string" 
}]);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [cuentaID, setCuentaID] = useState(3);
  const [productoActual, setProductoActual] = useState<Producto>({
    id: 0,
    nombre: '',
    descripcion: '',
    cantidad: 0,
    precioCompra: 0,
    precioVenta: 0,
    proveedor: '',
    img: null
  });

  useEffect(() => {
  const datosGuardados = localStorage.getItem('productos');
  if (datosGuardados) {
    setListaProductos(JSON.parse(datosGuardados));
    setCuentaID(listaProductos.length+2)
  }
  }, []);

  const abrirModalParaAgregar = () => {
    setProductoActual({
      id: cuentaID,
      nombre: '',
      descripcion: '',
      cantidad: 0,
      precioCompra: 0,
      precioVenta: 0,
      proveedor: '',
      img: null
    });
    setCuentaID(cuentaID+1)
    setModoEdicion(false);
    setMostrarModal(true);
  };

  const abrirModalParaEditar = (producto: Producto) => {
    setProductoActual(producto);
    setModoEdicion(true);
    setMostrarModal(true);
  };

  const eliminarProducto = () => {
  if (productoAEliminar) {
    setListaProductos(listaProductos.filter(p => p.id !== productoAEliminar.id));
    editProd(listaProductos);
    setProductoAEliminar(null);
    setMostrarConfirmacion(false);
  }
};

const confirmarEliminacion = (producto: Producto) => {
  setProductoAEliminar(producto);
  setMostrarConfirmacion(true);
};

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProductoActual({ ...productoActual, [name]: name === 'cantidad' || name.includes('precio') ? parseFloat(value) : value });
  };

  const manejarImagen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProductoActual({ ...productoActual, img: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const guardarProducto =  () => {
    if (modoEdicion) {
      setListaProductos(listaProductos.map(p => (p.id === productoActual.id ? productoActual : p)));
    } else {
      setListaProductos([...listaProductos, productoActual]);
    }
    editProd(listaProductos);
    setMostrarModal(false);
  };

  return (
    <div className="container mt-4">
      <h1>Inventario de Productos</h1>
      <Row className="mb-3 justify-content-between align-items-center px-3">
  <Col xs="auto">
    <Button onClick={() => setMostrarModal(true)} variant="primary">
      Agregar producto
    </Button>
  </Col>
  <Col xs="auto">
    <Button onClick={() => navigate('/historial-salidas')} variant="outline-secondary">
      Historial de salidas
    </Button>
  </Col>
</Row>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Precio Compra</th>
            <th>Precio Venta</th>
            <th>Proveedor</th>
            <th>Imagen</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {listaProductos.map((producto) => (
            <tr key={producto.id}>
              <td>{producto.id}</td>
              <td>{producto.nombre}</td>
              <td>{producto.descripcion}</td>
              <td>{producto.cantidad}</td>
              <td>${producto.precioCompra.toFixed(2)}</td>
              <td>${producto.precioVenta.toFixed(2)}</td>
              <td>{producto.proveedor}</td>
              <td>
                {producto.img && <img src={producto.img.toString()} alt={producto.nombre} width="80" />}
              </td>
              <td>
                <Button variant="warning" onClick={() => abrirModalParaEditar(producto)}>
                  Editar
                </Button>
                <Button variant="danger" className="ms-2" onClick={() => confirmarEliminacion(producto)}>
                  Eliminar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal show={mostrarModal} onHide={() => setMostrarModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{modoEdicion ? 'Editar Producto' : 'Agregar Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="nombre">
              <Form.Label>Nombre</Form.Label>
              <Form.Control
                type="text"
                name="nombre"
                value={productoActual.nombre}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group controlId="descripcion" className="mt-3">
              <Form.Label>Descripción</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="descripcion"
                value={productoActual.descripcion}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group controlId="cantidad" className="mt-3">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                name="cantidad"
                value={productoActual.cantidad}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group controlId="precioCompra" className="mt-3">
              <Form.Label>Precio de Compra</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="precioCompra"
                value={productoActual.precioCompra}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group controlId="precioVenta" className="mt-3">
              <Form.Label>Precio de Venta</Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                name="precioVenta"
                value={productoActual.precioVenta}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group controlId="proveedor">
              <Form.Label>Proveedor</Form.Label>
              <Form.Control
                type="text"
                name="proveedor"
                value={productoActual.proveedor}
                onChange={manejarCambio}
              />
            </Form.Group>

            <Form.Group controlId="imagen" className="mt-3">
              <Form.Label>Imagen del producto</Form.Label>
              <Form.Control type="file" accept="image/*" onChange={manejarImagen} />
              {productoActual.img && (
                <div className="mt-2">
                  <img src={productoActual.img.toString()} alt="Vista previa" width="100" />
                </div>
              )}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setMostrarModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={guardarProducto}>
            Guardar
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={mostrarConfirmacion} onHide={() => setMostrarConfirmacion(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Confirmar eliminación</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    ¿Estás seguro de que deseas eliminar el producto{' '}
    <strong>{productoAEliminar?.nombre}</strong>?
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setMostrarConfirmacion(false)}>
      Cancelar
    </Button>
    <Button variant="danger" onClick={eliminarProducto}>
      Eliminar
    </Button>
  </Modal.Footer>
</Modal>

    </div>
  );
};
