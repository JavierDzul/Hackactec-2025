import { useState } from 'react';
import { Table, Container, Row, Col } from 'react-bootstrap';

// Interfaces
interface ClienteVenta {
  id: string;
  nombreComercial: string;
  rfc: string;
}

interface ProductoVenta {
  id: string;
  tipo: "producto";
  nombre: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

interface ServicioVenta {
  id: number;
  tipo: "servicio";
  nombre: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
}

interface VentaProducto {
  id: string;
  fecha: string;
  cliente: ClienteVenta;
  producto: ProductoVenta;
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: string;
  facturaUuid: string;
}

interface VentaServicio {
  id: string;
  fecha: string;
  cliente: ClienteVenta;
  servicio: ServicioVenta;
  subtotal: number;
  descuento: number;
  total: number;
  metodoPago: string;
  facturaUuid: string;
}

// Hardcoded sales data: products
const VENTAS_PRODUCTOS: VentaProducto[] = [
  {
    id: "vp1",
    fecha: "2025-06-10T12:00:00",
    cliente: {
      id: "CLT-20240610-A012",
      nombreComercial: "TecnoSoluciones Avanzadas S.A. de C.V.",
      rfc: "TSA010101XYZ"
    },
    producto: {
      id: "p1",
      tipo: "producto",
      nombre: "Gorra promocional",
      descripcion: "Gorra con el logo de la empresa para los turistas",
      cantidad: 10,
      precioUnitario: 120,
      total: 1200
    },
    subtotal: 1200,
    descuento: 0,
    total: 1200,
    metodoPago: "01 Efectivo",
    facturaUuid: "fp1"
  },
  {
    id: "vp2",
    fecha: "2025-06-12T15:00:00",
    cliente: {
      id: "CLT-20230620-B088",
      nombreComercial: "Laura Fernández - Consultoría Digital",
      rfc: "FEGL850315ABC"
    },
    producto: {
      id: "p2",
      tipo: "producto",
      nombre: "Botella de agua",
      descripcion: "Botella de agua de 500ml para los clientes durante el tour",
      cantidad: 20,
      precioUnitario: 20,
      total: 400
    },
    subtotal: 400,
    descuento: 0,
    total: 400,
    metodoPago: "03 Transferencia",
    facturaUuid: "fp2"
  },
  {
    id: "vp3",
    fecha: "2025-06-15T10:00:00",
    cliente: {
      id: "CLT-20240310-C105",
      nombreComercial: "Manufacturas del Norte S. de R.L.",
      rfc: "MNO101010JKL"
    },
    producto: {
      id: "p3",
      tipo: "producto",
      nombre: "Mapa turístico",
      descripcion: "Mapa impreso de la ciudad y puntos de interés",
      cantidad: 5,
      precioUnitario: 35,
      total: 175
    },
    subtotal: 175,
    descuento: 0,
    total: 175,
    metodoPago: "01 Efectivo",
    facturaUuid: "fp3"
  }
];

// Hardcoded sales data: services
const VENTAS_SERVICIOS: VentaServicio[] = [
  {
    id: "vs1",
    fecha: "2025-06-10T12:00:00",
    cliente: {
      id: "CLT-20240610-A012",
      nombreComercial: "TecnoSoluciones Avanzadas S.A. de C.V.",
      rfc: "TSA010101XYZ"
    },
    servicio: {
      id: 1,
      tipo: "servicio",
      nombre: "Tour a Teotihuacán",
      descripcion: "Recorrido guiado por la zona arqueológica de Teotihuacán, incluye transporte y entradas.",
      cantidad: 1,
      precioUnitario: 2000,
      total: 2000
    },
    subtotal: 2000,
    descuento: 0,
    total: 2000,
    metodoPago: "01 Efectivo",
    facturaUuid: "fs1"
  },
  {
    id: "vs2",
    fecha: "2025-06-12T15:00:00",
    cliente: {
      id: "CLT-20230620-B088",
      nombreComercial: "Laura Fernández - Consultoría Digital",
      rfc: "FEGL850315ABC"
    },
    servicio: {
      id: 2,
      tipo: "servicio",
      nombre: "Tour Xochimilco",
      descripcion: "Paseo en trajinera por los canales de Xochimilco con guía y comida típica.",
      cantidad: 1,
      precioUnitario: 1800,
      total: 1800
    },
    subtotal: 1800,
    descuento: 0,
    total: 1800,
    metodoPago: "03 Transferencia",
    facturaUuid: "fs2"
  },
  {
    id: "vs3",
    fecha: "2025-06-15T10:00:00",
    cliente: {
      id: "CLT-20240310-C105",
      nombreComercial: "Manufacturas del Norte S. de R.L.",
      rfc: "MNO101010JKL"
    },
    servicio: {
      id: 3,
      tipo: "servicio",
      nombre: "Tour Centro Histórico",
      descripcion: "Caminata guiada por el centro histórico de la ciudad, incluye entradas a museos.",
      cantidad: 1,
      precioUnitario: 1500,
      total: 1500
    },
    subtotal: 1500,
    descuento: 0,
    total: 1500,
    metodoPago: "01 Efectivo",
    facturaUuid: "fs3"
  }
];

export const VentasPage = () => {
  const [ventasProductos] = useState<VentaProducto[]>(VENTAS_PRODUCTOS);
  const [ventasServicios] = useState<VentaServicio[]>(VENTAS_SERVICIOS);

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h3>Ventas de Productos</h3>
        </Col>
      </Row>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>RFC</th>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
            <th>Descuento</th>
            <th>Total</th>
            <th>Método de Pago</th>
            <th>Factura</th>
          </tr>
        </thead>
        <tbody>
          {ventasProductos.map((venta) => (
            <tr key={venta.id}>
              <td>{new Date(venta.fecha).toLocaleDateString()}</td>
              <td>{venta.cliente.nombreComercial}</td>
              <td>{venta.cliente.rfc}</td>
              <td>{venta.producto.nombre}</td>
              <td>{venta.producto.cantidad}</td>
              <td>${venta.producto.precioUnitario.toFixed(2)}</td>
              <td>${venta.subtotal.toFixed(2)}</td>
              <td>${venta.descuento.toFixed(2)}</td>
              <td>${venta.total.toFixed(2)}</td>
              <td>{venta.metodoPago}</td>
              <td>{venta.facturaUuid}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Row className="mb-4 mt-5">
        <Col>
          <h3>Ventas de Servicios</h3>
        </Col>
      </Row>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Cliente</th>
            <th>RFC</th>
            <th>Servicio</th>
            <th>Cantidad</th>
            <th>Precio Unitario</th>
            <th>Subtotal</th>
            <th>Descuento</th>
            <th>Total</th>
            <th>Método de Pago</th>
            <th>Factura</th>
          </tr>
        </thead>
        <tbody>
          {ventasServicios.map((venta) => (
            <tr key={venta.id}>
              <td>{new Date(venta.fecha).toLocaleDateString()}</td>
              <td>{venta.cliente.nombreComercial}</td>
              <td>{venta.cliente.rfc}</td>
              <td>{venta.servicio.nombre}</td>
              <td>{venta.servicio.cantidad}</td>
              <td>${venta.servicio.precioUnitario.toFixed(2)}</td>
              <td>${venta.subtotal.toFixed(2)}</td>
              <td>${venta.descuento.toFixed(2)}</td>
              <td>${venta.total.toFixed(2)}</td>
              <td>{venta.metodoPago}</td>
              <td>{venta.facturaUuid}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
