import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Card, Table, Button, Badge, Form, Modal, InputGroup, Pagination, Tabs, Tab, Alert } from "react-bootstrap";
import { FaUserPlus, FaUserEdit, FaUserTimes, FaSearch, FaBuilding, FaUserTie, FaFileInvoiceDollar, FaMapMarkerAlt, FaStickyNote, FaPhone, FaEnvelope, FaIdCard, FaRegAddressCard } from "react-icons/fa";

// Interfaces para una estructura de datos más detallada
export interface Direccion {
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  municipio: string;
  estado: string;
  pais: string;
  codigoPostal: string;
}

export interface Cliente {
  id: string; // Autogenerado, e.g., CLT-YYYYMMDD-XXXX
  nombreComercial: string;
  razonSocial: string;
  rfc: string;
  regimenFiscal: string; // Clave del régimen fiscal
  usoCFDI: string; // Clave del uso del CFDI
  
  fechaRegistro: string; // ISO Date string
  ultimaActividad?: string; // ISO Date string

  tipoCliente: "Persona Física" | "Persona Moral";
  segmentoCliente?: string;
  vendedorAsignado?: string;

  emailPrincipal: string;
  telefonoPrincipal: string;
  emailFacturacion?: string;
  telefonoFacturacion?: string;
  contactoPrincipalNombre: string;
  contactoPrincipalPuesto?: string;
  
  direccionFiscal: Direccion;
  direccionEnvio?: Direccion;

  limiteCredito: number;
  diasCredito: number;
  condicionesPago?: string;
  metodoPagoPreferido?: string;
  bancoPreferido?: string;
  cuentaBancaria?: string; // Últimos 4 dígitos o referencia

  estado: "Activo" | "Suspendido" | "Inactivo" | "Prospecto";
  notas?: string;
}

// Datos de ejemplo más realistas
const generarClientesEjemplo = (): Cliente[] => [
  {
    id: `CLT-${new Date(2024,0,15).toISOString().slice(0,10).replace(/-/g,'')}-A012`,
    nombreComercial: "TecnoSoluciones Avanzadas S.A. de C.V.",
    razonSocial: "TecnoSoluciones Avanzadas S.A. de C.V.",
    rfc: "TSA010101XYZ",
    regimenFiscal: "601", // General de Ley Personas Morales
    usoCFDI: "G01", // Adquisición de mercancías
    fechaRegistro: new Date(2024,0,15).toISOString(),
    ultimaActividad: new Date(2025,4,10).toISOString(),
    tipoCliente: "Persona Moral",
    segmentoCliente: "Corporativo",
    vendedorAsignado: "Ana Pérez",
    emailPrincipal: "contacto@tecnosoluciones.com",
    telefonoPrincipal: "55-1234-5670",
    emailFacturacion: "facturacion@tecnosoluciones.com",
    contactoPrincipalNombre: "Ing. Roberto Martínez",
    contactoPrincipalPuesto: "Director de TI",
    direccionFiscal: { calle: "Av. Insurgentes Sur", numeroExterior: "1500", colonia: "Crédito Constructor", municipio: "Benito Juárez", estado: "CDMX", pais: "México", codigoPostal: "03940" },
    limiteCredito: 250000,
    diasCredito: 30,
    condicionesPago: "Net 30",
    metodoPagoPreferido: "Transferencia Electrónica",
    bancoPreferido: "BBVA México",
    cuentaBancaria: "XXXX-1234",
    estado: "Activo",
    notas: "Cliente estratégico, alto volumen de compras."
  },
  {
    id: `CLT-${new Date(2023,5,20).toISOString().slice(0,10).replace(/-/g,'')}-B088`,
    nombreComercial: "Laura Fernández - Consultoría Digital",
    razonSocial: "Laura Elena Fernández García",
    rfc: "FEGL850315ABC",
    regimenFiscal: "612", // Personas Físicas con Actividades Empresariales y Profesionales
    usoCFDI: "P01", // Por definir
    fechaRegistro: new Date(2023,5,20).toISOString(),
    tipoCliente: "Persona Física",
    segmentoCliente: "Pequeña Empresa",
    vendedorAsignado: "Carlos López",
    emailPrincipal: "laura.fernandez@consultoria.mx",
    telefonoPrincipal: "33-9876-5432",
    contactoPrincipalNombre: "Laura Fernández",
    direccionFiscal: { calle: "Calle Libertad", numeroExterior: "123", colonia: "Centro", municipio: "Guadalajara", estado: "Jalisco", pais: "México", codigoPostal: "44100" },
    limiteCredito: 50000,
    diasCredito: 15,
    condicionesPago: "Contado",
    estado: "Activo",
    notas: "Requiere seguimiento cercano para nuevos proyectos."
  },
   {
    id: `CLT-${new Date(2024,2,10).toISOString().slice(0,10).replace(/-/g,'')}-C105`,
    nombreComercial: "Manufacturas del Norte S. de R.L.",
    razonSocial: "Manufacturas del Norte S. de R.L. de C.V.",
    rfc: "MNO101010JKL",
    regimenFiscal: "601",
    usoCFDI: "I04", // Equipo de computo y accesorios
    fechaRegistro: new Date(2024,2,10).toISOString(),
    tipoCliente: "Persona Moral",
    segmentoCliente: "Industrial",
    vendedorAsignado: "Ana Pérez",
    emailPrincipal: "compras@manufacturasnorte.com",
    telefonoPrincipal: "81-1234-0000",
    contactoPrincipalNombre: "Lic. Fernando Garza",
    contactoPrincipalPuesto: "Gerente de Compras",
    direccionFiscal: { calle: "Parque Industrial Stiva", numeroExterior: "100", colonia: "Apodaca Centro", municipio: "Apodaca", estado: "Nuevo León", pais: "México", codigoPostal: "66600" },
    limiteCredito: 150000,
    diasCredito: 45,
    condicionesPago: "Net 45",
    metodoPagoPreferido: "Cheque Nominativo",
    estado: "Prospecto",
    notas: "En proceso de negociación para primer pedido grande."
  }
];

const ITEMS_PER_PAGE = 5;

const ClienteComponenteDemo: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [clienteFormData, setClienteFormData] = useState<Partial<Cliente>>({});
  const [currentModalTab, setCurrentModalTab] = useState<string>("general");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [clienteToDelete, setClienteToDelete] = useState<Cliente | null>(null);


  useEffect(() => {
    const storedClientes = localStorage.getItem("clientesProfesionalDemo");
    if (storedClientes) {
      try {
        setClientes(JSON.parse(storedClientes));
      } catch {
        const ejemplos = generarClientesEjemplo();
        setClientes(ejemplos);
        localStorage.setItem("clientesProfesionalDemo", JSON.stringify(ejemplos));
      }
    } else {
      const ejemplos = generarClientesEjemplo();
      setClientes(ejemplos);
      localStorage.setItem("clientesProfesionalDemo", JSON.stringify(ejemplos));
    }
  }, []);

  useEffect(() => {
    // Evitar guardar un array vacío si se está cargando inicialmente
    if (clientes.length > 0) {
        localStorage.setItem("clientesProfesionalDemo", JSON.stringify(clientes));
    }
  }, [clientes]);

  const filteredClientes = useMemo(() =>
    clientes.filter(
      (c) =>
        c.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.razonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.contactoPrincipalNombre && c.contactoPrincipalNombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.emailPrincipal && c.emailPrincipal.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [clientes, searchTerm]);

  const paginatedClientes = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClientes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClientes, currentPage]);
  
  const totalPages = Math.ceil(filteredClientes.length / ITEMS_PER_PAGE);

  const handleOpenModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditingCliente(cliente);
      // Deep copy para evitar mutaciones directas del estado
      setClienteFormData(JSON.parse(JSON.stringify(cliente))); 
    } else {
      setEditingCliente(null);
      // Valores por defecto para nuevo cliente
      const defaultDireccion: Direccion = { calle: "", numeroExterior: "", colonia: "", municipio: "", estado: "", pais: "México", codigoPostal: "" };
      setClienteFormData({
        fechaRegistro: new Date().toISOString().split('T')[0],
        tipoCliente: "Persona Moral",
        estado: "Prospecto",
        limiteCredito: 0,
        diasCredito: 0,
        direccionFiscal: { ...defaultDireccion },
        direccionEnvio: { ...defaultDireccion },
      });
    }
    setCurrentModalTab("general");
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCliente(null);
    setClienteFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, section?: keyof Cliente, subField?: keyof Direccion) => {
    const { name, value } = e.target;
    
    setClienteFormData(prev => {
      const newState = { ...prev };
      if (section === "direccionFiscal" || section === "direccionEnvio") {
        if(subField) {
          newState[section] = {
            ...(newState[section] as Direccion),
            [subField]: value
          };
        }
      } else if (section) {
         // @ts-ignore
        newState[section] = {
           // @ts-ignore
          ...(prev[section] as any), 
          [name]: value
        };
      }
      else {
         // @ts-ignore
        newState[name] = value;
      }
      return newState;
    });
  };
  
  const handleDireccionChange = (e: React.ChangeEvent<HTMLInputElement>, tipoDireccion: "direccionFiscal" | "direccionEnvio") => {
    const { name, value } = e.target;
    setClienteFormData(prev => ({
      ...prev,
      [tipoDireccion]: {
        ...(prev[tipoDireccion] as Direccion),
        [name]: value
      }
    }));
  };


  const handleSaveCliente = () => {
    // Aquí iría una validación más robusta en un caso real
    if (!clienteFormData.nombreComercial || !clienteFormData.rfc || !clienteFormData.razonSocial) {
      alert("Nombre Comercial, Razón Social y RFC son obligatorios.");
      return;
    }

    if (editingCliente) {
      setClientes(prev => prev.map(cl => cl.id === editingCliente.id ? { ...editingCliente, ...clienteFormData } as Cliente : cl));
    } else {
      const nuevoCliente: Cliente = {
        id: `CLT-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${String(Math.random()).slice(2,6)}`,
        ...clienteFormData,
        fechaRegistro: clienteFormData.fechaRegistro || new Date().toISOString(),
      } as Cliente; // Se asume que clienteFormData tendrá los campos necesarios
      setClientes(prev => [nuevoCliente, ...prev]);
    }
    handleCloseModal();
  };

  const handleDeleteCliente = (cliente: Cliente) => {
    setClienteToDelete(cliente);
    setShowDeleteConfirmModal(true);
  };

  const confirmDelete = () => {
    if (clienteToDelete) {
      setClientes(prev => prev.filter(c => c.id !== clienteToDelete.id));
    }
    setShowDeleteConfirmModal(false);
    setClienteToDelete(null);
  };
  
  const renderDireccionForm = (tipo: "direccionFiscal" | "direccionEnvio") => (
    <Row>
      <Col md={8}><Form.Group className="mb-2"><Form.Label>Calle</Form.Label><Form.Control type="text" name="calle" value={clienteFormData[tipo]?.calle || ""} onChange={(e) => handleDireccionChange(e as any, tipo)} /></Form.Group></Col>
      <Col md={4}><Form.Group className="mb-2"><Form.Label>No. Ext.</Form.Label><Form.Control type="text" name="numeroExterior" value={clienteFormData[tipo]?.numeroExterior || ""} onChange={(e) => handleDireccionChange(e as any, tipo)} /></Form.Group></Col>
      <Col md={4}><Form.Group className="mb-2"><Form.Label>No. Int. (Opcional)</Form.Label><Form.Control type="text" name="numeroInterior" value={clienteFormData[tipo]?.numeroInterior || ""} onChange={(e) => handleDireccionChange(e as any, tipo)} /></Form.Group></Col>
      <Col md={8}><Form.Group className="mb-2"><Form.Label>Colonia</Form.Label><Form.Control type="text" name="colonia" value={clienteFormData[tipo]?.colonia || ""} onChange={(e) => handleDireccionChange(e as any, tipo)} /></Form.Group></Col>
      <Col md={4}><Form.Group className="mb-2"><Form.Label>C.P.</Form.Label><Form.Control type="text" name="codigoPostal" value={clienteFormData[tipo]?.codigoPostal || ""} onChange={(e) => handleDireccionChange(e as any, tipo)} /></Form.Group></Col>
      <Col md={4}><Form.Group className="mb-2"><Form.Label>Municipio</Form.Label><Form.Control type="text" name="municipio" value={clienteFormData[tipo]?.municipio || ""} onChange={(e) => handleDireccionChange(e as any, tipo)} /></Form.Group></Col>
      <Col md={4}><Form.Group className="mb-2"><Form.Label>Estado</Form.Label><Form.Control type="text" name="estado" value={clienteFormData[tipo]?.estado || ""} onChange={(e) => handleDireccionChange(e as any, tipo)} /></Form.Group></Col>
      <Col md={4}><Form.Group className="mb-2"><Form.Label>País</Form.Label><Form.Control type="text" name="pais" value={clienteFormData[tipo]?.pais || "México"} onChange={(e) => handleDireccionChange(e as any, tipo)} /></Form.Group></Col>
    </Row>
  );

  return (
    <Container fluid className="mt-4">
      <Card className="shadow-sm">
        <Card.Header as="h5" className="bg-primary text-white d-flex justify-content-between align-items-center">
          <span><FaRegAddressCard className="me-2"/>Gestión Avanzada de Clientes</span>
          <Button variant="light" size="sm" onClick={() => handleOpenModal()}>
            <FaUserPlus className="me-1" /> Nuevo Cliente
          </Button>
        </Card.Header>
        <Card.Body>
          <Form.Group as={Row} className="mb-3">
            <Col sm={12}>
              <InputGroup>
                <InputGroup.Text><FaSearch /></InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Buscar por Nombre, Razón Social, RFC, Contacto o Email..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1);}}
                />
              </InputGroup>
            </Col>
          </Form.Group>

          {paginatedClientes.length === 0 && searchTerm && (
            <Alert variant="info">No se encontraron clientes con el término de búsqueda.</Alert>
          )}
          {paginatedClientes.length === 0 && !searchTerm && (
            <Alert variant="info">No hay clientes para mostrar. Comience agregando uno nuevo.</Alert>
          )}

          {paginatedClientes.length > 0 && (
            <Table striped bordered hover responsive="lg" size="sm">
              <thead className="table-light">
                <tr>
                  <th>ID</th>
                  <th>Nombre Comercial</th>
                  <th>RFC</th>
                  <th>Contacto Principal</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {paginatedClientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td><small>{cliente.id}</small></td>
                    <td>{cliente.nombreComercial}</td>
                    <td>{cliente.rfc}</td>
                    <td>{cliente.contactoPrincipalNombre}</td>
                    <td>{cliente.telefonoPrincipal}</td>
                    <td>
                      <Badge bg={ cliente.estado === "Activo" ? "success" : cliente.estado === "Suspendido" ? "warning" : cliente.estado === "Inactivo" ? "secondary" : "info" }>
                        {cliente.estado}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Button variant="outline-primary" size="sm" className="me-1" title="Editar Cliente" onClick={() => handleOpenModal(cliente)}> <FaUserEdit /> </Button>
                      <Button variant="outline-danger" size="sm" title="Eliminar Cliente" onClick={() => handleDeleteCliente(cliente)}> <FaUserTimes /> </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <Pagination size="sm">
                <Pagination.Prev onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} />
                {[...Array(totalPages)].map((_, i) => (
                  <Pagination.Item key={i + 1} active={i + 1 === currentPage} onClick={() => setCurrentPage(i + 1)}>
                    {i + 1}
                  </Pagination.Item>
                ))}
                <Pagination.Next onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} />
              </Pagination>
            </div>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title className="text-primary">
            {editingCliente ? <><FaUserEdit className="me-2"/>Editar Cliente: {editingCliente.nombreComercial}</> : <><FaUserPlus className="me-2"/>Nuevo Cliente</>}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{maxHeight: '70vh', overflowY: 'auto'}}>
          <Form>
            <Tabs activeKey={currentModalTab} onSelect={(k) => setCurrentModalTab(k || "general")} id="cliente-modal-tabs" className="mb-3">
              <Tab eventKey="general" title={<><FaUserTie className="me-1"/>General</>}>
                <Row>
                  <Col md={6}><Form.Group className="mb-2"><Form.Label>Nombre Comercial*</Form.Label><Form.Control type="text" name="nombreComercial" value={clienteFormData.nombreComercial || ""} onChange={handleChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-2"><Form.Label>Razón Social*</Form.Label><Form.Control type="text" name="razonSocial" value={clienteFormData.razonSocial || ""} onChange={handleChange} /></Form.Group></Col>
                </Row>
                 <Row>
                  <Col md={4}><Form.Group className="mb-2"><Form.Label>RFC*</Form.Label><Form.Control type="text" name="rfc" value={clienteFormData.rfc || ""} onChange={handleChange} /></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-2"><Form.Label>Tipo Cliente</Form.Label><Form.Select name="tipoCliente" value={clienteFormData.tipoCliente || "Persona Moral"} onChange={handleChange}><option>Persona Moral</option><option>Persona Física</option></Form.Select></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-2"><Form.Label>Fecha Registro</Form.Label><Form.Control type="date" name="fechaRegistro" value={clienteFormData.fechaRegistro?.split('T')[0] || ""} onChange={handleChange} /></Form.Group></Col>
                </Row>
                <Row>
                  <Col md={4}><Form.Group className="mb-2"><Form.Label>Segmento</Form.Label><Form.Control type="text" name="segmentoCliente" placeholder="Ej: Corporativo, PyME" value={clienteFormData.segmentoCliente || ""} onChange={handleChange} /></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-2"><Form.Label>Vendedor Asignado</Form.Label><Form.Control type="text" name="vendedorAsignado" value={clienteFormData.vendedorAsignado || ""} onChange={handleChange} /></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-2"><Form.Label>Estado</Form.Label><Form.Select name="estado" value={clienteFormData.estado || "Prospecto"} onChange={handleChange}><option>Activo</option><option>Suspendido</option><option>Inactivo</option><option>Prospecto</option></Form.Select></Form.Group></Col>
                </Row>
              </Tab>
              <Tab eventKey="contacto" title={<><FaPhone className="me-1"/>Contacto</>}>
                 <Row>
                  <Col md={6}><Form.Group className="mb-2"><Form.Label>Nombre Contacto Principal</Form.Label><Form.Control type="text" name="contactoPrincipalNombre" value={clienteFormData.contactoPrincipalNombre || ""} onChange={handleChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-2"><Form.Label>Puesto Contacto</Form.Label><Form.Control type="text" name="contactoPrincipalPuesto" value={clienteFormData.contactoPrincipalPuesto || ""} onChange={handleChange} /></Form.Group></Col>
                </Row>
                <Row>
                  <Col md={6}><Form.Group className="mb-2"><Form.Label>Email Principal</Form.Label><Form.Control type="email" name="emailPrincipal" value={clienteFormData.emailPrincipal || ""} onChange={handleChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-2"><Form.Label>Teléfono Principal</Form.Label><Form.Control type="tel" name="telefonoPrincipal" value={clienteFormData.telefonoPrincipal || ""} onChange={handleChange} /></Form.Group></Col>
                </Row>
                 <Row>
                  <Col md={6}><Form.Group className="mb-2"><Form.Label>Email Facturación (Opcional)</Form.Label><Form.Control type="email" name="emailFacturacion" value={clienteFormData.emailFacturacion || ""} onChange={handleChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-2"><Form.Label>Teléfono Facturación (Opcional)</Form.Label><Form.Control type="tel" name="telefonoFacturacion" value={clienteFormData.telefonoFacturacion || ""} onChange={handleChange} /></Form.Group></Col>
                </Row>
              </Tab>
              <Tab eventKey="fiscal" title={<><FaIdCard className="me-1"/>Información Fiscal</>}>
                <Row>
                   <Col md={6}><Form.Group className="mb-2"><Form.Label>Régimen Fiscal (Clave SAT)</Form.Label><Form.Control type="text" name="regimenFiscal" placeholder="Ej: 601, 612" value={clienteFormData.regimenFiscal || ""} onChange={handleChange} /></Form.Group></Col>
                   <Col md={6}><Form.Group className="mb-2"><Form.Label>Uso CFDI (Clave SAT)</Form.Label><Form.Control type="text" name="usoCFDI" placeholder="Ej: G01, P01, I04" value={clienteFormData.usoCFDI || ""} onChange={handleChange} /></Form.Group></Col>
                </Row>
                <h6 className="mt-3">Dirección Fiscal</h6> <hr className="mt-0"/>
                {renderDireccionForm("direccionFiscal")}
              </Tab>
              <Tab eventKey="facturacion" title={<><FaFileInvoiceDollar className="me-1"/>Facturación y Pago</>}>
                <Row>
                  <Col md={3}><Form.Group className="mb-2"><Form.Label>Límite Crédito (MXN)</Form.Label><Form.Control type="number" name="limiteCredito" value={clienteFormData.limiteCredito || 0} onChange={handleChange} /></Form.Group></Col>
                  <Col md={3}><Form.Group className="mb-2"><Form.Label>Días Crédito</Form.Label><Form.Control type="number" name="diasCredito" value={clienteFormData.diasCredito || 0} onChange={handleChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-2"><Form.Label>Condiciones de Pago</Form.Label><Form.Control type="text" name="condicionesPago" placeholder="Ej: Net 30, Contado" value={clienteFormData.condicionesPago || ""} onChange={handleChange} /></Form.Group></Col>
                </Row>
                <Row>
                  <Col md={4}><Form.Group className="mb-2"><Form.Label>Método Pago Preferido</Form.Label><Form.Control type="text" name="metodoPagoPreferido" placeholder="Ej: Transferencia" value={clienteFormData.metodoPagoPreferido || ""} onChange={handleChange} /></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-2"><Form.Label>Banco Preferido</Form.Label><Form.Control type="text" name="bancoPreferido" value={clienteFormData.bancoPreferido || ""} onChange={handleChange} /></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-2"><Form.Label>Cuenta Bancaria (Ref.)</Form.Label><Form.Control type="text" name="cuentaBancaria" placeholder="Ej: XXXX-1234" value={clienteFormData.cuentaBancaria || ""} onChange={handleChange} /></Form.Group></Col>
                </Row>
              </Tab>
              <Tab eventKey="direccionEnvio" title={<><FaMapMarkerAlt className="me-1"/>Dirección de Envío</>}>
                <p className="text-muted small">Llenar sólo si es diferente a la dirección fiscal.</p>
                {renderDireccionForm("direccionEnvio")}
              </Tab>
               <Tab eventKey="notas" title={<><FaStickyNote className="me-1"/>Notas</>}>
                <Form.Group>
                  <Form.Label>Notas Adicionales</Form.Label>
                  <Form.Control as="textarea" rows={4} name="notas" value={clienteFormData.notas || ""} onChange={handleChange} />
                </Form.Group>
              </Tab>
            </Tabs>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleCloseModal}>Cancelar</Button>
          <Button variant="primary" onClick={handleSaveCliente}><FaUserPlus className="me-1"/> Guardar Cliente</Button>
        </Modal.Footer>
      </Modal>

      {/* Confirm Delete Modal */}
      <Modal show={showDeleteConfirmModal} onHide={() => setShowDeleteConfirmModal(false)} centered size="sm">
        <Modal.Header closeButton>
          <Modal.Title>Confirmar Eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          ¿Está seguro de que desea eliminar al cliente: <strong>{clienteToDelete?.nombreComercial}</strong>? Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirmModal(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Eliminar
          </Button>
        </Modal.Footer>
      </Modal>

    </Container>
  );
};

export default ClienteComponenteDemo;