import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Button, Badge, Tabs, Tab, Alert, Modal, Form, Accordion } from 'react-bootstrap';
import { FaExclamationTriangle, FaShieldAlt, FaClipboardList, FaFirstAid, FaFireExtinguisher, FaBolt, FaUserShield, FaHeadset, FaArchive, FaPlayCircle, FaCheckSquare, FaSpinner, FaListOl } from 'react-icons/fa';

// Interfaces
interface RiesgoMIPYME {
  id: string;
  nombre: string;
  tipo: 'Desastre Natural' | 'Crisis Sanitaria' | 'Falla Operativa' | 'Financiero' | 'Ciberseguridad';
  probabilidad: 'Baja' | 'Media' | 'Alta';
  impactoPotencial: 'Leve' | 'Moderado' | 'Grave';
  descripcionBreve: string;
  medidasPreventivasClave: string[];
  estadoMitigacion?: string;
}

interface ProtocoloPasoMIPYME {
  id: string;
  orden: number;
  accion: string;
  responsableSugerido: string; // e.g., "Dueño/Gerente", "Encargado de Tienda", "Personal Clave"
  recursosApoyo?: string; // e.g., "Lista de contactos de emergencia", "Botiquín", "Extintor"
  completado?: boolean; // Para simulación de activación
}

interface ProtocoloEmergenciaMIPYME {
  id: string;
  nombre: string;
  riesgoAsociadoPrincipal: string; // Nombre del riesgo principal que activa este protocolo
  objetivoPrincipal: string;
  icono: React.ElementType;
  pasos: ProtocoloPasoMIPYME[];
  contactosEmergenciaRecomendados?: { entidad: string; telefono: string; }[];
}

interface PlanContinuidadSeccionMIPYME {
    id: string;
    titulo: string;
    descripcionGeneral: string;
    accionesClaveRecomendadas: string[];
    responsablePrincipalSugerido: string;
}

// Datos de Ejemplo para MIPYMES
const RIESGOS_EJEMPLO_MIPYME: RiesgoMIPYME[] = [
  { id: 'R001', nombre: 'Inundación Local', tipo: 'Desastre Natural', probabilidad: 'Media', impactoPotencial: 'Grave', descripcionBreve: 'Anegamiento de local por lluvias intensas o desbordamiento cercano.', medidasPreventivasClave: ['Revisar seguros con cobertura de inundación.', 'Almacenar mercancía valiosa en zonas elevadas.', 'Tener barreras o sacos de arena disponibles.'], estadoMitigacion: 'En Análisis' },
  { id: 'R002', nombre: 'Brote de Enfermedad (ej. Gripe Fuerte)', tipo: 'Crisis Sanitaria', probabilidad: 'Media', impactoPotencial: 'Moderado', descripcionBreve: 'Ausentismo laboral significativo y/o reducción de clientela por enfermedad contagiosa.', medidasPreventivasClave: ['Fomentar vacunación.', 'Protocolos de higiene y limpieza reforzados.', 'Plan para trabajo remoto si es posible.'], estadoMitigacion: 'Implementado' },
  { id: 'R003', nombre: 'Falla Prolongada de Electricidad', tipo: 'Falla Operativa', probabilidad: 'Baja', impactoPotencial: 'Moderado', descripcionBreve: 'Corte de luz por más de 4 horas afectando operaciones y refrigeración.', medidasPreventivasClave: ['Considerar generador pequeño o UPS para equipos críticos.', 'Lista de proveedores con hielo.', 'Protocolo de manejo de perecederos.'], estadoMitigacion: 'Identificado' },
  { id: 'R004', nombre: 'Robo o Vandalismo', tipo: 'Falla Operativa', probabilidad: 'Media', impactoPotencial: 'Moderado', descripcionBreve: 'Pérdida de inventario o daños al local.', medidasPreventivasClave: ['Sistemas de alarma y cámaras.', 'Buenas prácticas de cierre.', 'Seguro contra robo.'], estadoMitigacion: 'Implementado'},
];

const PROTOCOLOS_EJEMPLO_MIPYME: ProtocoloEmergenciaMIPYME[] = [
  { 
    id: 'P001', nombre: 'Protocolo de Evacuación por Inundación', riesgoAsociadoPrincipal: 'Inundación Local', icono: FaExclamationTriangle,
    objetivoPrincipal: 'Salvaguardar la integridad del personal y clientes, y minimizar pérdidas materiales.',
    pasos: [
      { id: 'P001S1', orden: 1, accion: 'Monitorear alertas meteorológicas y niveles de agua cercanos.', responsableSugerido: 'Dueño/Gerente', recursosApoyo: 'Radio con baterías, App de Protección Civil' },
      { id: 'P001S2', orden: 2, accion: 'Desconectar equipos eléctricos si el agua empieza a subir.', responsableSugerido: 'Personal Designado', recursosApoyo: 'Guantes aislantes (si es seguro)' },
      { id: 'P001S3', orden: 3, accion: 'Mover mercancía y documentos importantes a zonas altas.', responsableSugerido: 'Todo el personal disponible' },
      { id: 'P001S4', orden: 4, accion: 'Si la evacuación es necesaria, dirigir a todos a la salida de emergencia y punto de encuentro seguro.', responsableSugerido: 'Dueño/Gerente', recursosApoyo: 'Ruta de evacuación visible' },
      { id: 'P001S5', orden: 5, accion: 'Cerrar llaves de paso de agua y gas (si es seguro hacerlo).', responsableSugerido: 'Personal Designado' },
      { id: 'P001S6', orden: 6, accion: 'Contactar a servicios de emergencia si es necesario y a la aseguradora.', responsableSugerido: 'Dueño/Gerente', recursosApoyo: 'Teléfonos de emergencia, póliza de seguro' },
    ],
    contactosEmergenciaRecomendados: [ { entidad: 'Protección Civil Local', telefono: '911 o Local'}, { entidad: 'Bomberos', telefono: '911 o Local'} ]
  },
  {
    id: 'P002', nombre: 'Protocolo de Actuación ante Síntomas de Enfermedad Contagiosa', riesgoAsociadoPrincipal: 'Brote de Enfermedad', icono: FaFirstAid,
    objetivoPrincipal: 'Proteger la salud de empleados y clientes, y asegurar la continuidad operativa mínima.',
    pasos: [
      { id: 'P002S1', orden: 1, accion: 'Si un empleado presenta síntomas, aislarlo si es posible y enviarlo a casa/servicio médico.', responsableSugerido: 'Dueño/Gerente', recursosApoyo: 'Termómetro, cubrebocas' },
      { id: 'P002S2', orden: 2, accion: 'Identificar personal que tuvo contacto cercano y monitorear síntomas.', responsableSugerido: 'Dueño/Gerente' },
      { id: 'P002S3', orden: 3, accion: 'Reforzar limpieza y desinfección de áreas comunes y superficies de alto contacto.', responsableSugerido: 'Personal de Limpieza/Todos', recursosApoyo: 'Desinfectante, guantes' },
      { id: 'P002S4', orden: 4, accion: 'Comunicar medidas preventivas a empleados y clientes (uso de cubrebocas, gel, etc.).', responsableSugerido: 'Dueño/Gerente' },
      { id: 'P002S5', orden: 5, accion: 'Evaluar necesidad de reducir aforo o implementar trabajo remoto parcial si la situación escala.', responsableSugerido: 'Dueño/Gerente' },
    ],
    contactosEmergenciaRecomendados: [ { entidad: 'Servicio Médico Local / Doctor de Cabecera', telefono: 'Variable'} ]
  },
];

const PLAN_CONTINUIDAD_EJEMPLO_MIPYME: PlanContinuidadSeccionMIPYME[] = [
    { id: 'PC01', titulo: 'Equipo de Respuesta y Comunicación', descripcionGeneral: 'Establecer quién toma decisiones y cómo se comunicarán durante una crisis.', accionesClaveRecomendadas: ['Designar un líder de crisis (usualmente el dueño).', 'Tener una lista actualizada de contactos de empleados y proveedores clave.', 'Definir un canal de comunicación primario y uno secundario (ej. Grupo de WhatsApp, Email).'], responsablePrincipalSugerido: 'Dueño / Gerente General'},
    { id: 'PC02', titulo: 'Continuidad de Operaciones Esenciales', descripcionGeneral: 'Identificar las actividades mínimas para seguir operando o recuperarse rápidamente.', accionesClaveRecomendadas: ['Listar procesos críticos del negocio.', 'Identificar personal indispensable para esos procesos.', 'Considerar alternativas si el local no está disponible (ej. ventas online, trabajo desde casa temporal).'], responsablePrincipalSugerido: 'Dueño / Gerente de Operaciones'},
    { id: 'PC03', titulo: 'Seguridad de la Información y Datos', descripcionGeneral: 'Proteger la información vital del negocio.', accionesClaveRecomendadas: ['Realizar copias de seguridad regulares de datos importantes (contabilidad, clientes) y guardarlas externamente.', 'Contraseñas seguras y cambiarlas periódicamente.', 'Software antivirus actualizado.'], responsablePrincipalSugerido: 'Dueño / Encargado de TI (si aplica)'},
    { id: 'PC04', titulo: 'Proveedores y Cadena de Suministro', descripcionGeneral: 'Asegurar el suministro de insumos o servicios clave.', accionesClaveRecomendadas: ['Identificar proveedores críticos.', 'Buscar al menos un proveedor alternativo para insumos esenciales.', 'Mantener buena comunicación con proveedores.'], responsablePrincipalSugerido: 'Encargado de Compras / Dueño'},
];


const GestionRiesgosResilienciaMIPYMEDashboard: React.FC = () => {
  const [riesgos, setRiesgos] = useState<RiesgoMIPYME[]>(RIESGOS_EJEMPLO_MIPYME);
  const [protocolos, setProtocolos] = useState<ProtocoloEmergenciaMIPYME[]>(PROTOCOLOS_EJEMPLO_MIPYME);
  const [planContinuidad, setPlanContinuidad] = useState<PlanContinuidadSeccionMIPYME[]>(PLAN_CONTINUIDAD_EJEMPLO_MIPYME);
  
  const [protocoloSeleccionado, setProtocoloSeleccionado] = useState<ProtocoloEmergenciaMIPYME | null>(null);
  const [pasosProtocoloActivo, setPasosProtocoloActivo] = useState<ProtocoloPasoMIPYME[]>([]);
  const [estadoActivacionProtocolo, setEstadoActivacionProtocolo] = useState<'No Iniciado' | 'En Progreso' | 'Finalizado'>('No Iniciado');
  const [showProtocoloModal, setShowProtocoloModal] = useState(false);

  const handleVerActivarProtocolo = (protocolo: ProtocoloEmergenciaMIPYME) => {
    setProtocoloSeleccionado(protocolo);
    setPasosProtocoloActivo(protocolo.pasos.map(p => ({ ...p, completado: false }))); // Resetear completado
    setEstadoActivacionProtocolo('No Iniciado');
    setShowProtocoloModal(true);
  };

  const handleCerrarProtocoloModal = () => {
    setShowProtocoloModal(false);
    setProtocoloSeleccionado(null);
  };

  const handleTogglePasoCompletado = (pasoId: string) => {
    setPasosProtocoloActivo(prevPasos => {
        const nuevosPasos = prevPasos.map(p => p.id === pasoId ? { ...p, completado: !p.completado } : p);
        const todosCompletados = nuevosPasos.every(p => p.completado);
        const algunoCompletado = nuevosPasos.some(p => p.completado);

        if (todosCompletados) setEstadoActivacionProtocolo('Finalizado');
        else if (algunoCompletado) setEstadoActivacionProtocolo('En Progreso');
        else setEstadoActivacionProtocolo('No Iniciado');
        
        return nuevosPasos;
    });
  };
  
  const getBadgeVariant = (value: string, type: 'probabilidad' | 'impacto') => {
    if (type === 'probabilidad') {
        if (value === 'Alta') return 'danger';
        if (value === 'Media') return 'warning';
        return 'success'; // Baja
    } else { // impacto
        if (value === 'Grave') return 'danger';
        if (value === 'Moderado') return 'warning';
        return 'info'; // Leve
    }
  };

  return (
    <Container fluid className="pt-3 pb-5 bg-light">
      <Card className="shadow-sm mb-4 border-0">
        <Card.Header as="h5" className="bg-danger text-white d-flex align-items-center" style={{fontSize: '1.2rem'}}>
            <FaShieldAlt className="me-2" /> Gestión de Riesgos y Plan de Continuidad (MIPYME)
        </Card.Header>
        <Card.Body>
            <p className="text-muted">
                Preparar su negocio para imprevistos es crucial. Esta guía le ayuda a identificar riesgos, entender su plan de continuidad y activar protocolos de emergencia.
            </p>
        </Card.Body>
      </Card>

      <Tabs defaultActiveKey="riesgos" id="gestion-riesgos-tabs" className="mb-3 nav-tabs-professional" fill>
        <Tab eventKey="riesgos" title={<><FaExclamationTriangle className="me-1"/>Identificación de Riesgos</>}>
            <Card className="shadow-sm">
                <Card.Header as="h6" className="py-2">Principales Riesgos Potenciales para su MIPYME</Card.Header>
                <ListGroup variant="flush">
                    {riesgos.map(riesgo => (
                        <ListGroup.Item key={riesgo.id}>
                            <Row>
                                <Col md={3}><strong>{riesgo.nombre}</strong> <Badge bg="secondary" pill>{riesgo.tipo}</Badge></Col>
                                <Col md={4} className="small">{riesgo.descripcionBreve}</Col>
                                <Col md={2} className="text-center">Probabilidad: <Badge bg={getBadgeVariant(riesgo.probabilidad, 'probabilidad')}>{riesgo.probabilidad}</Badge></Col>
                                <Col md={2} className="text-center">Impacto: <Badge bg={getBadgeVariant(riesgo.impactoPotencial, 'impacto')}>{riesgo.impactoPotencial}</Badge></Col>
                                <Col md={1} className="text-center"><Badge bg="info">{riesgo.estadoMitigacion}</Badge></Col>
                            </Row>
                             <Accordion flush className="mt-1">
                                <Accordion.Item eventKey={riesgo.id}>
                                    <Accordion.Header as="div" className="py-1 small text-primary" style={{cursor:'pointer'}}>Ver Medidas Preventivas</Accordion.Header>
                                    <Accordion.Body className="small pt-1">
                                        <ul>{riesgo.medidasPreventivasClave.map((m, i) => <li key={i}>{m}</li>)}</ul>
                                    </Accordion.Body>
                                </Accordion.Item>
                            </Accordion>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card>
        </Tab>

      
        <Tab eventKey="protocolos" title={<><FaListOl className="me-1"/>Protocolos de Emergencia</>}>
            <Card className="shadow-sm">
                <Card.Header as="h6" className="py-2">Guías Paso a Paso para Activar Protocolos</Card.Header>
                <Card.Body>
                    <Row xs={1} md={2} lg={3} className="g-3">
                        {protocolos.map(protocolo => (
                            <Col key={protocolo.id}>
                                <Card className="h-100 shadow-hover">
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title as="h6" className="text-primary"><protocolo.icono className="me-2"/>{protocolo.nombre}</Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted small">Asociado a: {protocolo.riesgoAsociadoPrincipal}</Card.Subtitle>
                                        <Card.Text className="small flex-grow-1">{protocolo.objetivoPrincipal}</Card.Text>
                                        <Button variant="outline-danger" size="sm" onClick={() => handleVerActivarProtocolo(protocolo)} className="mt-auto">
                                            <FaPlayCircle className="me-1"/> Ver / Activar Guía
                                        </Button>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </Card.Body>
            </Card>
        </Tab>
      </Tabs>

      {/* Modal para Ver/Activar Protocolo */}
      <Modal show={showProtocoloModal} onHide={handleCerrarProtocoloModal} size="lg" backdrop="static">
        <Modal.Header closeButton className={
            estadoActivacionProtocolo === 'Finalizado' ? 'bg-success text-white' :
            estadoActivacionProtocolo === 'En Progreso' ? 'bg-warning text-dark' : 'bg-danger text-white'
        }>
          <Modal.Title style={{fontSize: '1.1rem'}}>
            {protocoloSeleccionado?.icono && <protocoloSeleccionado.icono className="me-2"/>}
            {protocoloSeleccionado?.nombre} - Guía de Activación
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {protocoloSeleccionado && (
            <>
              <Alert variant="info" className="small">
                <strong>Objetivo:</strong> {protocoloSeleccionado.objetivoPrincipal} <br/>
                <strong>Estado Actual: </strong> 
                <Badge pill bg={
                    estadoActivacionProtocolo === 'Finalizado' ? 'success' :
                    estadoActivacionProtocolo === 'En Progreso' ? 'warning' : 'secondary'
                }>
                    {estadoActivacionProtocolo === 'En Progreso' && <FaSpinner className="fa-spin me-1"/>}
                    {estadoActivacionProtocolo}
                </Badge>
              </Alert>
              
              <h6>Pasos a Seguir:</h6>
              <ListGroup variant="flush">
                {pasosProtocoloActivo.map(paso => (
                  <ListGroup.Item key={paso.id} className={`d-flex justify-content-between align-items-start ps-2 pe-2 pt-1 pb-1 ${paso.completado ? 'bg-light text-muted' : ''}`}>
                    <Form.Check 
                      type="checkbox"
                      id={`paso-${paso.id}`}
                      checked={paso.completado || false}
                      onChange={() => handleTogglePasoCompletado(paso.id)}
                      className="me-2 flex-shrink-0 mt-1"
                    />
                    <div className="ms-2 me-auto">
                      <div className={`fw-bold small ${paso.completado ? 'text-decoration-line-through' : ''}`}>Paso {paso.orden}: {paso.accion}</div>
                      <span className="text-muted" style={{fontSize: '0.75rem'}}>
                        <em>Resp. Sugerido: {paso.responsableSugerido}</em>
                        {paso.recursosApoyo && ` | Apoyo: ${paso.recursosApoyo}`}
                      </span>
                    </div>
                    {paso.completado && <FaCheckSquare className="text-success ms-2 mt-1" />}
                  </ListGroup.Item>
                ))}
              </ListGroup>

              {protocoloSeleccionado.contactosEmergenciaRecomendados && protocoloSeleccionado.contactosEmergenciaRecomendados.length > 0 && (
                <div className="mt-3">
                    <h6 className="small">Contactos de Emergencia Clave:</h6>
                    <ul className="list-unstyled small">
                    {protocoloSeleccionado.contactosEmergenciaRecomendados.map(c => <li key={c.entidad}><FaHeadset className="me-1"/><strong>{c.entidad}:</strong> {c.telefono}</li>)}
                    </ul>
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="py-2">
          <Button variant="secondary" size="sm" onClick={handleCerrarProtocoloModal}>
            Cerrar Guía
          </Button>
        </Modal.Footer>
      </Modal>
      <style type="text/css">{`
        .nav-tabs-professional .nav-link {color: #495057; border-bottom: 2px solid transparent;}
        .nav-tabs-professional .nav-link.active {color: #dc3545; border-bottom-color: #dc3545; font-weight: bold;}
        .nav-tabs-professional .nav-link:hover {border-bottom-color: #c82333;}
        .shadow-hover:hover { box-shadow: 0 .5rem 1rem rgba(0,0,0,.15)!important; transition: box-shadow .2s ease-in-out; }
        .accordion-header.py-1 .accordion-button { padding-top: 0.4rem; padding-bottom: 0.4rem; font-size: 0.85rem;}
        .accordion-button:not(.collapsed) { color: #0d6efd; background-color: #e7f1ff; }
      `}</style>
    </Container>
  );
};

export default GestionRiesgosResilienciaMIPYMEDashboard;