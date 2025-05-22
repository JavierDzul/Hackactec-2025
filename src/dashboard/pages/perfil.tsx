import React, { useState, useMemo, useCallback } from 'react';
import { Container, Row, Col, Card, ListGroup, Badge, Button, Alert, Modal, ProgressBar, Table, Tooltip, OverlayTrigger, Stack, Image } from 'react-bootstrap';
import { 
  FaBuilding, FaMapMarkerAlt, FaCertificate, FaLink, FaExclamationCircle, 
  FaCheckCircle, FaTimesCircle, FaSyncAlt, FaFileUpload, FaKey, 
  FaEnvelopeOpenText, FaFileContract, FaPrint, FaRedo, FaSearch, FaUserTie,
  FaCalendarAlt, FaPhone, FaAt, FaLandmark, FaFileSignature, FaBell, FaTasks, FaShieldAlt
} from 'react-icons/fa';

// --- INTERFACES (Estructura de Datos) ---
interface CertificadoDigital {
  nombre?: string; // Para distinguir entre CSDs
  numeroSerie: string;
  validoDesde: string;
  validoHasta: string;
  estatus: 'Vigente' | 'Por Vencer' | 'Vencido' | 'Revocado';
  tipo?: 'FIEL' | 'CSD'; // Para identificar el tipo
}

interface DomicilioFiscal {
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  codigoPostal: string;
  municipio: string;
  estado: string;
  pais: string;
}

interface VinculacionSAT {
  efirma: CertificadoDigital & { estatusConexion?: 'Activa' | 'Inactiva' | 'Requiere Atención' };
  csd: CertificadoDigital[];
  buzonTributario: {
    estatus: 'Vinculado' | 'No Vinculado' | 'Con Notificaciones';
    ultimaConsulta?: string;
    notificacionesPendientes?: number;
  };
  opinionCumplimiento: {
    estatus: 'Positiva' | 'Negativa' | 'En Proceso' | 'No Disponible';
    fechaEmision?: string;
    validezHasta?: string;
    urlDescargaSimulada?: string;
  };
  constanciaSituacionFiscal: {
    ultimaGeneracion?: string;
    urlDescargaSimulada?: string;
  };
  declaracionesPendientes?: number;
}

interface EmpresaInfo {
  razonSocial: string;
  nombreComercial?: string;
  rfc: string;
  regimenFiscal: string;
  logoUrl?: string; // URL del logo de la empresa
  domicilioFiscal: DomicilioFiscal;
  telefono?: string;
  correoElectronico?: string;
  fechaConstitucion?: string;
  representanteLegal?: string;
  vinculacionSAT: VinculacionSAT;
}

// --- DATOS SIMULADOS ---
const domicilioSimulado: DomicilioFiscal = {
  calle: "Av. Paseo de la Reforma",
  numeroExterior: "222",
  numeroInterior: "Piso 10, Of. 1001",
  colonia: "Cuauhtémoc",
  codigoPostal: "06500",
  municipio: "Ciudad de México",
  estado: "CDMX",
  pais: "México",
};

const efirmaSimulada: CertificadoDigital & { estatusConexion?: 'Activa' | 'Inactiva' | 'Requiere Atención' } = {
  nombre: "e.firma Principal",
  numeroSerie: "30001000000400001234",
  validoDesde: "2024-01-15",
  validoHasta: "2028-01-14",
  estatus: "Vigente",
  estatusConexion: "Activa",
  tipo: 'FIEL'
};

const csdSimulados: CertificadoDigital[] = [
  {
    nombre: "CSD Facturación Suc. Centro",
    numeroSerie: "20001000000500005678",
    validoDesde: "2024-08-10",
    validoHasta: "2026-08-09", // Por vencer en ~90 días desde hoy (2025-05-22)
    estatus: "Vigente",
    tipo: 'CSD'
  },
  {
    nombre: "CSD Nómina Principal",
    numeroSerie: "20001000000300009101",
    validoDesde: "2023-07-20",
    validoHasta: "2025-07-19", 
    estatus: "Vigente", // Será detectado como "Por Vencer" por la función
    tipo: 'CSD'
  },
   {
    nombre: "CSD Antiguo (Inactivo)",
    numeroSerie: "20001000000100001122",
    validoDesde: "2022-01-01",
    validoHasta: "2024-01-01", 
    estatus: "Vencido",
    tipo: 'CSD'
  },
];

const vinculacionSATSimulada: VinculacionSAT = {
  efirma: efirmaSimulada,
  csd: csdSimulados,
  buzonTributario: {
    estatus: "Con Notificaciones",
    ultimaConsulta: "2025-05-20 09:30:00",
    notificacionesPendientes: 3,
  },
  opinionCumplimiento: {
    estatus: "Positiva",
    fechaEmision: "2025-05-01",
    validezHasta: "2025-05-31", // Vencida para demostración
    urlDescargaSimulada: "#descargar-opinion-simulada"
  },
  constanciaSituacionFiscal: {
    ultimaGeneracion: "2025-04-15",
    urlDescargaSimulada: "#descargar-csf-simulada"
  },
  declaracionesPendientes: 1,
};

const empresaInfoSimulada: EmpresaInfo = {
  razonSocial: "Innovaciones Textiles Mexicanas S. de R.L. de C.V.",
  nombreComercial: "InnovaTex",
  rfc: "ITM200515XYZ",
  regimenFiscal: "Régimen Simplificado de Confianza (RESICO) - Persona Moral",
  logoUrl: "https://via.placeholder.com/150/0275d8/FFFFFF?Text=InnovaTex",
  domicilioFiscal: domicilioSimulado,
  telefono: "55-5012-3456",
  correoElectronico: "administracion@innovatex.com.mx",
  fechaConstitucion: "2020-05-15",
  representanteLegal: "Roberto Carlos Fernández Garza",
  vinculacionSAT: vinculacionSATSimulada,
};

// --- HELPERS ---
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'N/D';
  return new Date(dateString).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

const isNearExpiry = (dateString: string, daysThreshold = 90): boolean => {
  if (!dateString) return false;
  const expiryDate = new Date(dateString);
  const today = new Date(); // Fecha actual del sistema del usuario
  const diffTime = expiryDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= daysThreshold && diffDays > 0;
};

const getStatusCertBadge = (certificado: CertificadoDigital)=> {
  let variant: string;
  let effectiveStatus = certificado.estatus;
  const today = new Date();
  const expiryDate = new Date(certificado.validoHasta);

  if (expiryDate < today && effectiveStatus !== 'Vencido' && effectiveStatus !== 'Revocado') {
    effectiveStatus = 'Vencido';
  }
  
  const nearExpiry = isNearExpiry(certificado.validoHasta) && effectiveStatus === 'Vigente';

  let statusText = effectiveStatus;
  if (nearExpiry) {
    statusText = 'Por Vencer';
  }

  switch (effectiveStatus) {
    case 'Vigente':
      variant = nearExpiry ? 'warning' : 'success';
      break;
    case 'Por Vencer':
      variant = 'warning';
      break;
    case 'Vencido':
      variant = 'danger';
      break;
    case 'Revocado':
      variant = 'dark';
      break;
    default:
      variant = 'secondary';
  }
  return <Badge bg={variant} text={variant === 'warning' ? 'dark' : 'white'} pill>{statusText}</Badge>;
};


// --- COMPONENTE PRINCIPAL ---
export const EmpresaDashboardPage: React.FC = () => {
  const [empresaInfo] = useState<EmpresaInfo>(empresaInfoSimulada);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionModalContent, setActionModalContent] = useState({ title: '', body: '' });

  const handleShowActionModal = (title: string, body: string) => {
    setActionModalContent({ title, body });
    setShowActionModal(true);
  };

  const criticalAlerts = useMemo(() => {
    const alerts: string[] = [];
    const { efirma, csd, buzonTributario, opinionCumplimiento, declaracionesPendientes } = empresaInfo.vinculacionSAT;

    if (efirma.estatus === 'Vencido' || efirma.estatus === 'Revocado' || isNearExpiry(efirma.validoHasta, 30)) {
      alerts.push(`e.firma ${efirma.estatus === 'Vigente' ? 'próxima a vencer' : efirma.estatus.toLowerCase()}.`);
    }
    csd.forEach(c => {
      if (c.estatus === 'Vencido' || c.estatus === 'Revocado' || isNearExpiry(c.validoHasta, 30)) {
        alerts.push(`CSD (${c.numeroSerie.slice(-4)}) ${c.estatus === 'Vigente' ? 'próximo a vencer' : c.estatus.toLowerCase()}.`);
      }
    });
    if (buzonTributario.estatus === 'Con Notificaciones' && (buzonTributario.notificacionesPendientes ?? 0) > 0) {
      alerts.push(`Tiene ${buzonTributario.notificacionesPendientes} notificaciones en el Buzón Tributario.`);
    }
    if (opinionCumplimiento.estatus === 'Negativa') {
      alerts.push("Opinión de Cumplimiento Negativa.");
    } else if (opinionCumplimiento.validezHasta && new Date(opinionCumplimiento.validezHasta) < new Date()) {
        alerts.push("Opinión de Cumplimiento Vencida.");
    }
    if ((declaracionesPendientes ?? 0) > 0) {
      alerts.push(`Tiene ${declaracionesPendientes} declaraciones pendientes.`);
    }
    return alerts;
  }, [empresaInfo.vinculacionSAT]);

  const handleSyncSAT = useCallback(() => {
    setShowSyncModal(true);
    setSyncProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setSyncProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setShowSyncModal(false);
          handleShowActionModal("Sincronización con SAT", "La información ha sido actualizada exitosamente (simulado).");
        }, 500);
      }
    }, 300);
  }, []);

  const renderTooltip = (props: any, text: string) => (
    <Tooltip id="button-tooltip" {...props}>
      {text}
    </Tooltip>
  );

  return (
    <Container fluid className="py-4 px-xl-4 px-md-3 px-2 bg-body-tertiary min-vh-100">
      <Row className="mb-3 align-items-center">
        <Col xs={12} md>
          <h1 className="h3 mb-0 text-primary d-flex align-items-center">
            <FaLandmark className="me-2"/> Información de la Empresa
          </h1>
        </Col>
        <Col xs={12} md="auto" className="mt-2 mt-md-0">
          <Button variant="outline-primary" onClick={handleSyncSAT} size="sm">
            <FaSyncAlt className="me-1 spin-on-hover" /> Sincronizar con SAT
          </Button>
        </Col>
      </Row>

      {criticalAlerts.length > 0 && (
        <Alert variant="danger" className="shadow-sm">
          <h5 className="alert-heading"><FaExclamationCircle className="me-2"/> ¡Atención Requerida!</h5>
          <ul className="mb-0">
            {criticalAlerts.map((alert, index) => <li key={index}>{alert}</li>)}
          </ul>
        </Alert>
      )}

      <Row>
        {/* Columna Izquierda: Datos Generales y Domicilio */}
        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm border-light">
            <Card.Header className="bg-light border-bottom d-flex align-items-center">
              <h5 className="mb-0"><FaBuilding className="me-2 text-primary"/>Datos Generales</h5>
            </Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item><FaUserTie className="me-2 text-muted"/><strong>Razón Social:</strong> {empresaInfo.razonSocial}</ListGroup.Item>
              {empresaInfo.nombreComercial && <ListGroup.Item><strong>Nombre Comercial:</strong> {empresaInfo.nombreComercial}</ListGroup.Item>}
              <ListGroup.Item><FaFileSignature className="me-2 text-muted"/><strong>RFC:</strong> <Badge bg="secondary">{empresaInfo.rfc}</Badge></ListGroup.Item>
              <ListGroup.Item><strong>Régimen Fiscal:</strong> {empresaInfo.regimenFiscal}</ListGroup.Item>
              <ListGroup.Item><FaCalendarAlt className="me-2 text-muted"/><strong>Fecha de Constitución:</strong> {formatDate(empresaInfo.fechaConstitucion)}</ListGroup.Item>
              <ListGroup.Item><strong>Representante Legal:</strong> {empresaInfo.representanteLegal || 'N/D'}</ListGroup.Item>
              <ListGroup.Item><FaPhone className="me-2 text-muted"/><strong>Teléfono:</strong> {empresaInfo.telefono || 'N/D'}</ListGroup.Item>
              <ListGroup.Item><FaAt className="me-2 text-muted"/><strong>Correo Electrónico:</strong> {empresaInfo.correoElectronico || 'N/D'}</ListGroup.Item>
            </ListGroup>
            <Card.Body>
                <Button variant="outline-secondary" size="sm" onClick={() => handleShowActionModal("Editar Datos Generales", "Funcionalidad para editar datos generales (simulada).")}>
                     Editar Información
                </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6} className="mb-4">
          <Card className="h-100 shadow-sm border-light">
            <Card.Header className="bg-light border-bottom"><h5 className="mb-0"><FaMapMarkerAlt className="me-2 text-primary"/>Domicilio Fiscal</h5></Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item><strong>Calle:</strong> {empresaInfo.domicilioFiscal.calle} {empresaInfo.domicilioFiscal.numeroExterior} {empresaInfo.domicilioFiscal.numeroInterior && `Int. ${empresaInfo.domicilioFiscal.numeroInterior}`}</ListGroup.Item>
              <ListGroup.Item><strong>Colonia:</strong> {empresaInfo.domicilioFiscal.colonia}</ListGroup.Item>
              <ListGroup.Item><strong>C.P.:</strong> {empresaInfo.domicilioFiscal.codigoPostal}</ListGroup.Item>
              <ListGroup.Item><strong>Municipio/Alcaldía:</strong> {empresaInfo.domicilioFiscal.municipio}</ListGroup.Item>
              <ListGroup.Item><strong>Estado:</strong> {empresaInfo.domicilioFiscal.estado}</ListGroup.Item>
            </ListGroup>
             <Card.Body>
                <Button variant="outline-secondary" size="sm" onClick={() => handleShowActionModal("Editar Domicilio Fiscal", "Funcionalidad para editar domicilio (simulada).")}>
                    Editar Domicilio
                </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Columna Certificados */}
        <Col lg={12} className="mb-4"> {/* Ocupa toda la fila para la tabla */}
          <Card className="shadow-sm border-light">
            <Card.Header className="bg-light border-bottom"><h5 className="mb-0"><FaCertificate className="me-2 text-primary"/>Certificados Digitales</h5></Card.Header>
            <Card.Body>
              <h6 className="text-muted mb-2"><FaKey className="me-2"/>e.firma (FIEL)</h6>
              <ListGroup horizontal="md" className="mb-3">
                <ListGroup.Item className="flex-fill"><strong>No. Serie:</strong> {empresaInfo.vinculacionSAT.efirma.numeroSerie}</ListGroup.Item>
                <ListGroup.Item className="flex-fill"><strong>Vigencia:</strong> {formatDate(empresaInfo.vinculacionSAT.efirma.validoDesde)} - {formatDate(empresaInfo.vinculacionSAT.efirma.validoHasta)}</ListGroup.Item>
                <ListGroup.Item className="flex-fill"><strong>Estatus:</strong> {getStatusCertBadge(empresaInfo.vinculacionSAT.efirma)}</ListGroup.Item>
              </ListGroup>
              <Button variant="outline-info" size="sm" className="mb-3" onClick={() => handleShowActionModal("Gestionar e.firma", "Aquí podría renovar o revocar su e.firma (simulado).")}>
                <FaFileUpload className="me-1"/> Gestionar e.firma
              </Button>

              <h6 className="text-muted mb-2 mt-3"><FaShieldAlt className="me-2"/>Certificados de Sello Digital (CSD)</h6>
              {empresaInfo.vinculacionSAT.csd.length > 0 ? (
                <Table striped bordered hover responsive size="sm" className="mt-2">
                  <thead className="table-light">
                    <tr>
                      <th>Nombre/Alias</th>
                      <th>No. Serie</th>
                      <th>Válido Desde</th>
                      <th>Válido Hasta</th>
                      <th className="text-center">Estatus</th>
                      <th className="text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {empresaInfo.vinculacionSAT.csd.map(csd => (
                      <tr key={csd.numeroSerie}>
                        <td>{csd.nombre || 'CSD Principal'}</td>
                        <td>{csd.numeroSerie}</td>
                        <td>{formatDate(csd.validoDesde)}</td>
                        <td>{formatDate(csd.validoHasta)}</td>
                        <td className="text-center">{getStatusCertBadge(csd)}</td>
                        <td className="text-center">
                           <OverlayTrigger placement="top" overlay={(props) => renderTooltip(props, "Verificar validez del CSD")}>
                            <Button variant="outline-secondary" size="sm" onClick={() => handleShowActionModal("Verificar CSD", `Verificando CSD ${csd.numeroSerie.slice(-4)} con el SAT (simulado)...`)}>
                                <FaSearch />
                            </Button>
                           </OverlayTrigger>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              ) : (<Alert variant="light">No hay CSDs registrados.</Alert>)}
              <Button variant="outline-info" size="sm" onClick={() => handleShowActionModal("Agregar CSD", "Aquí podría cargar un nuevo Certificado de Sello Digital (simulado).")}>
                
                Agregar Nuevo CSD
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Row>
        {/* Columna Vinculación SAT */}
        <Col lg={12} className="mb-4">
          <Card className="shadow-sm border-light">
            <Card.Header className="bg-light border-bottom"><h5 className="mb-0"><FaLink className="me-2 text-primary"/>Vinculación y Estatus SAT</h5></Card.Header>
            <Row className="g-0"> {/* No gutter para que las cards internas se vean como una sola */}
                <Col md={6} className="border-end-md">
                    <ListGroup variant="flush">
                     
                        <ListGroup.Item>
                            <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1"><FaFileContract className="me-2 text-muted"/>Opinión de Cumplimiento</h6>
                                <Badge bg={empresaInfo.vinculacionSAT.opinionCumplimiento.estatus === 'Positiva' ? 'success' : 'danger'} pill>
                                    {empresaInfo.vinculacionSAT.opinionCumplimiento.estatus}
                                </Badge>
                            </div>
                            <small className="text-muted">Emitida: {formatDate(empresaInfo.vinculacionSAT.opinionCumplimiento.fechaEmision)}, Válida hasta: {formatDate(empresaInfo.vinculacionSAT.opinionCumplimiento.validezHasta)}</small>
                            <Stack direction="horizontal" gap={2} className="mt-1 justify-content-end">
                                <Button variant="link" size="sm" className="p-0" onClick={() => handleShowActionModal("Obtener Opinión de Cumplimiento", "Generando nueva Opinión de Cumplimiento   ...")}>Actualizar</Button>
                                {empresaInfo.vinculacionSAT.opinionCumplimiento.urlDescargaSimulada && 
                                 <Button variant="link" size="sm" className="p-0" href={empresaInfo.vinculacionSAT.opinionCumplimiento.urlDescargaSimulada} target="_blank">Descargar</Button>}
                            </Stack>
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
                <Col md={6}>
                     <ListGroup variant="flush">
                        <ListGroup.Item>
                            <div className="d-flex w-100 justify-content-between">
                                <h6 className="mb-1"><FaPrint className="me-2 text-muted"/>Constancia de Situación Fiscal</h6>
                            </div>
                            <small className="text-muted">Última generación: {formatDate(empresaInfo.vinculacionSAT.constanciaSituacionFiscal.ultimaGeneracion)}</small>
                            <Stack direction="horizontal" gap={2} className="mt-1 justify-content-end">
                                <Button variant="link" size="sm" className="p-0" onClick={() => handleShowActionModal("Obtener Constancia de Situación Fiscal", "Generando nueva Constancia (simulado)...")}>Actualizar</Button>
                                {empresaInfo.vinculacionSAT.constanciaSituacionFiscal.urlDescargaSimulada && 
                                 <Button variant="link" size="sm" className="p-0" href={empresaInfo.vinculacionSAT.constanciaSituacionFiscal.urlDescargaSimulada} target="_blank">Descargar</Button>}
                            </Stack>
                        </ListGroup.Item>
                        <ListGroup.Item>
                            <div className="d-flex w-100 justify-content-between">
                                 <h6 className="mb-1"><FaTasks className="me-2 text-muted"/>Declaraciones Fiscales</h6>
                                 {(empresaInfo.vinculacionSAT.declaracionesPendientes ?? 0) > 0 ? 
                                    <Badge bg="danger" pill>{empresaInfo.vinculacionSAT.declaracionesPendientes} Pendientes</Badge> :
                                    <Badge bg="success" pill>Al corriente</Badge>
                                 }
                            </div>
                            <small className="text-muted">Estatus general de declaraciones.</small>
                            <Button variant="link" size="sm" className="p-0 float-end" onClick={() => handleShowActionModal("Ver Declaraciones", "Mostrando resumen de declaraciones fiscales (simulado)...")}>Ver detalle</Button>
                        </ListGroup.Item>
                    </ListGroup>
                </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Modal para Sincronización SAT */}
      <Modal show={showSyncModal} onHide={() => setShowSyncModal(false)} centered backdrop="static">
        <Modal.Header>
          <Modal.Title><FaSyncAlt className="me-2 spin"/> Sincronizando con SAT</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>Estableciendo conexión segura y actualizando información...</p>
          <ProgressBar animated now={syncProgress} label={`${syncProgress}%`} className="my-3"/>
          <small className="text-muted">Este proceso puede tardar unos momentos.</small>
        </Modal.Body>
      </Modal>

      {/* Modal Genérico para Acciones Simuladas */}
      <Modal show={showActionModal} onHide={() => setShowActionModal(false)} centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="h6">{actionModalContent.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{actionModalContent.body}</Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowActionModal(false)}>Cerrar</Button>
        </Modal.Footer>
      </Modal>
      <style type="text/css">{`
        .spin {
          animation: spin 2s linear infinite;
        }
        .spin-on-hover:hover .fa-sync-alt {
            animation: spin 2s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .border-end-md { /* Para Bootstrap 5, aplicar borde solo en md y superior */
            @media (min-width: 768px) {
                border-right: 1px solid #dee2e6; /* Color de borde por defecto de Bootstrap */
            }
        }
        .list-group-horizontal-md .list-group-item {
            border-bottom-width: 1px; /* Restaura el borde inferior por defecto */
        }
        @media (min-width: 768px) { /* md breakpoint */
            .list-group-horizontal-md .list-group-item {
                border-bottom-width: 0; /* Quita borde inferior en horizontal */
                border-right-width: 1px; /* Añade borde derecho */
            }
            .list-group-horizontal-md .list-group-item:last-child {
                border-right-width: 0; /* Quita borde derecho del último elemento */
            }
        }
      `}</style>
    </Container>
  );
};