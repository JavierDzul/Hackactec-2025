import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  cantidad: number;
  precioCompra: number;
  precioVenta: number;
  proveedor: string;
  img: string | ArrayBuffer | null;
}

const PRODUCTOS_TURISMO: Producto[] = [
  {
    id: "p1",
    nombre: "Gorra promocional",
    descripcion: "Gorra con el logo de la empresa para los turistas",
    cantidad: 50,
    precioCompra: 80,
    precioVenta: 120,
    proveedor: "PromosMX",
    img: "src/assets/gorra.jpg"
  },
  {
    id: "p2",
    nombre: "Botella de agua",
    descripcion: "Botella de agua de 500ml para los clientes durante el tour",
    cantidad: 200,
    precioCompra: 12,
    precioVenta: 20,
    proveedor: "AguaPura",
    img: "src/assets/agua.jpg"
  },
  {
    id: "p3",
    nombre: "Mapa turístico",
    descripcion: "Mapa impreso de la ciudad y puntos de interés",
    cantidad: 100,
    precioCompra: 20,
    precioVenta: 35,
    proveedor: "ImpresionesCDMX",
    img: "src/assets/mapa.jpg"
  },
  {
    id: "p4",
    nombre: "Playera conmemorativa",
    descripcion: "Playera conmemorativa del tour",
    cantidad: 30,
    precioCompra: 120,
    precioVenta: 180,
    proveedor: "TextilesTur",
    img: "src/assets/playera.jpg"
  },
  {
    id: "p5",
    nombre: "Kit de primeros auxilios",
    descripcion: "Kit básico de primeros auxilios para emergencias durante el tour",
    cantidad: 10,
    precioCompra: 180,
    precioVenta: 250,
    proveedor: "SaludTur",
    img: "src/assets/primeros_auxilios.jpg"
  }
];

export const InventarioPage = () => {
  const navigate = useNavigate();

  const [listaProductos, setListaProductos] = useState<Producto[]>(PRODUCTOS_TURISMO);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);
  const [productoActual, setProductoActual] = useState<Producto>({
    id: '',
    nombre: '',
    descripcion: '',
    cantidad: 0,
    precioCompra: 0,
    precioVenta: 0,
    proveedor: '',
    img: null
  });

  const abrirModalParaAgregar = () => {
    setProductoActual({
      id: crypto.randomUUID(),
      nombre: '',
      descripcion: '',
      cantidad: 0,
      precioCompra: 0,
      precioVenta: 0,
      proveedor: '',
      img: null
    });
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
      const nuevaLista = listaProductos.filter(p => p.id !== productoAEliminar.id);
      setListaProductos(nuevaLista);
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
    setProductoActual({
      ...productoActual,
      [name]: name === 'cantidad' || name.includes('precio') ? parseFloat(value) : value
    });
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

  const guardarProducto = () => {
    let nuevaLista: Producto[];
    if (modoEdicion) {
      nuevaLista = listaProductos.map(p => (p.id === productoActual.id ? productoActual : p));
    } else {
      nuevaLista = [...listaProductos, productoActual];
    }
    setListaProductos(nuevaLista);
    setMostrarModal(false);
  };

  return (
    <div className="container mt-4">
      <h1>Inventario de Productos</h1>
      <Row className="mb-3 justify-content-between align-items-center px-3">
        <Col xs="auto">
          <Button onClick={abrirModalParaAgregar} variant="primary">
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
