import React from 'react';
import { Container, Row, Col, Card, ListGroup, Alert, Badge, Accordion } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaDollarSign, FaCalendarAlt, FaChartLine, FaExclamationTriangle, FaExclamationCircle, FaInfoCircle, FaClock, FaCalendarWeek, FaBullhorn, FaFlask, FaCloudSun, FaLightbulb, FaShieldAlt, FaUniversity, FaIndustry, FaUsers, FaStore, FaFileInvoiceDollar, FaHandHoldingUsd } from 'react-icons/fa'; // Usando react-icons para consistencia
const formatCurrencyMxn = (value: number | bigint) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value));

// --- Datos Simulados Mejorados y Realistas para MIPYME (MXN) ---
const FECHA_ACTUAL_UTC = "2025-05-22 08:19:28"; // UTC Date from prompt
const USUARIO_ACTUAL = "rafaello129";

const kpiData = {
  currentBalance: 85750.75, // Saldo actual en MXN
  nextCriticalDate: '2025-07-10', // Fecha crítica realista
  criticalReason: 'Pago de nómina quincenal y renta de local',
  avgMonthlyNetFlow: 12500.00, // Flujo neto mensual promedio MXN
  burnRate: -18500.00, // Tasa de gasto mensual si los ingresos fueran cero MXN
  runwayMonths: 4.6, // Meses de operación restantes con el saldo actual si no hay ingresos (Saldo / BurnRate absoluto)
  alertsCount: { critical: 1, warning: 2, info: 1 }
};

const cashFlowData = [
  // Datos históricos y proyectados más detallados para una MIPYME
  { month: 'Ene \'25', ingresosProyectados: 70000, egresosProyectados: 55000, flujoProyectado: 15000, flujoReal: 16500 },
  { month: 'Feb \'25', ingresosProyectados: 65000, egresosProyectados: 58000, flujoProyectado: 7000, flujoReal: 6800 },
  { month: 'Mar \'25', ingresosProyectados: 75000, egresosProyectados: 60000, flujoProyectado: 15000, flujoReal: 17200 },
  { month: 'Abr \'25', ingresosProyectados: 55000, egresosProyectados: 62000, flujoProyectado: -7000, flujoReal: -6500, evento: 'Inicio Temporada Baja Ventas' },
  { month: 'May \'25', ingresosProyectados: 60000, egresosProyectados: 59000, flujoProyectado: 1000, flujoReal: 2500 },
  { month: 'Jun \'25', ingresosProyectados: 85000, egresosProyectados: 65000, flujoProyectado: 20000, flujoReal: 18500, evento: 'Promociones "Día del Padre"' },
  { month: 'Jul \'25', ingresosProyectados: 70000, egresosProyectados: 75000, flujoProyectado: -5000, flujoReal: null, eventoCritico: 'Pago Nómina y Renta' }, // Mes crítico
  { month: 'Ago \'25', ingresosProyectados: 68000, egresosProyectados: 60000, flujoProyectado: 8000, flujoReal: null },
  { month: 'Sep \'25', ingresosProyectados: 78000, egresosProyectados: 62000, flujoProyectado: 16000, flujoReal: null, evento: 'Regreso a Clases (si aplica)'},
  { month: 'Oct \'25', ingresosProyectados: 90000, egresosProyectados: 68000, flujoProyectado: 22000, flujoReal: null, evento: 'Preparativos Fin de Año' },
  { month: 'Nov \'25', ingresosProyectados: 100000, egresosProyectados: 70000, flujoProyectado: 30000, flujoReal: null, evento: 'Buen Fin (Estimado)' },
  { month: 'Dic \'25', ingresosProyectados: 120000, egresosProyectados: 75000, flujoProyectado: 45000, flujoReal: null, evento: 'Ventas Navideñas' },
];

const predictiveAlertsData = [
  { 
    id: 1, 
    severity: 'danger',
    icon: FaExclamationTriangle,
    title: 'Alerta Crítica: Riesgo de Déficit de Liquidez en Julio',
    message: `Se proyecta un flujo de efectivo negativo de ${formatCurrencyMxn(-5000)} para el 10 de Julio, coincidiendo con el pago de nómina quincenal ($${(35000).toLocaleString('es-MX')}) y la renta del local ($${(18000).toLocaleString('es-MX')}). El saldo actual podría no ser suficiente si los ingresos de principios de mes no cumplen expectativas.`,
    timestamp: '2025-06-15 09:15:00', // Fecha de generación de alerta
    actionableSteps: [
      'Confirmar y asegurar ingresos esperados para la primera semana de Julio.',
      'Evaluar posibilidad de un pequeño crédito puente o adelanto de cobros.',
      'Comunicar proactivamente con el arrendador si se anticipa un ligero retraso.'
    ]
  },
  { 
    id: 2, 
    severity: 'warning', 
    icon: FaExclamationCircle,
    title: 'Aviso: Impacto de Temporada Baja en Abril',
    message: `El flujo proyectado para Abril es de ${formatCurrencyMxn(-7000)}, marcando el inicio de la temporada baja. Aunque se recupera en Mayo, es crucial monitorear los gastos operativos durante este periodo.`,
    timestamp: '2025-03-25 11:00:00',
    actionableSteps: [
      'Implementar plan de reducción de gastos variables (ej. horas extra, compras menores).',
      'Focalizar esfuerzos en promociones para clientes recurrentes.',
      'Revisar niveles de inventario para evitar sobre stock de productos de baja rotación.'
    ]
  },
  { 
    id: 3, 
    severity: 'info', 
    icon: FaInfoCircle,
    title: 'Oportunidad: Potencial de Ventas por "Buen Fin" en Noviembre',
    message: `Se estima un incremento significativo en ingresos para Noviembre (Flujo Proyectado: ${formatCurrencyMxn(30000)}) debido al "Buen Fin". Es una excelente oportunidad para maximizar ventas.`,
    timestamp: '2025-09-30 16:30:00',
    actionableSteps: [
      'Planificar campañas de marketing y promociones con anticipación.',
      'Negociar con proveedores para asegurar stock y posibles descuentos por volumen.',
      'Preparar personal y logística para un aumento en la demanda.'
    ]
  }
];

const modelingInputs = {
  datosHistoricos: ["Flujo de caja (últimos 24-36 meses)", "Ventas detalladas por producto/servicio", "Costos fijos y variables históricos", "Ciclos de cobro a clientes y pago a proveedores"],
  patronesEstacionales: ["Impacto de temporadas altas/bajas (turismo, escolar, etc.)", "Efecto de días festivos y puentes", "Variaciones por clima (si aplica, ej. venta de aires acondicionados)"],
  eventosMercadoLocal: ["Calendario de ferias, festivales y eventos comunitarios", "Apertura/cierre de negocios competidores o complementarios", "Obras públicas o cambios en vialidades cercanas"],
  condicionesEconomicasMacro: ["Inflación general y específica del sector", "Tasas de interés (si se manejan créditos)", "Tipo de cambio (si hay transacciones en USD)", "Confianza del consumidor local"],
  factoresInternosNegocio: ["Lanzamiento de nuevos productos/servicios", "Campañas de marketing planificadas", "Cambios en precios o políticas de crédito", "Rotación de personal clave"]
};

// --- Funciones de Formato y Componentes ---

const KPISection = () => {
  return (
    <Row className="mb-4 g-3"> {/* g-3 para gutters entre columnas */}
      <Col md={6} lg={3} className="mb-3 mb-lg-0">
        <Card className="shadow-sm h-100 border-start border-success border-4">
          <Card.Body className="d-flex flex-column">
            <Card.Title className="text-success mb-1"><FaDollarSign className="me-2" />Saldo Actual</Card.Title>
            <h3 className="fw-bold mt-auto">{formatCurrencyMxn(kpiData.currentBalance)}</h3>
            <small className="text-muted">Al {new Date(FECHA_ACTUAL_UTC).toLocaleDateString('es-MX')}</small>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} lg={3} className="mb-3 mb-lg-0">
        <Card className="shadow-sm h-100 border-start border-danger border-4">
          <Card.Body className="d-flex flex-column">
            <Card.Title className="text-danger mb-1"><FaCalendarAlt className="me-2" />Próximo Punto Crítico</Card.Title>
            <h4 className="mt-auto">{new Date(kpiData.nextCriticalDate + 'T00:00:00').toLocaleDateString('es-MX', {day: '2-digit', month: 'long', year: 'numeric'})}</h4>
            <p className="mb-0 text-danger small">{kpiData.criticalReason}</p>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} lg={3} className="mb-3 mb-md-0">
        <Card className="shadow-sm h-100 border-start border-primary border-4">
          <Card.Body className="d-flex flex-column">
            <Card.Title className="text-primary mb-1">
              <FaChartLine className={`me-2 ${kpiData.avgMonthlyNetFlow >= 0 ? '' : 'text-warning'}`} />
              Flujo Neto Prom. Mensual
            </Card.Title>
            <h4 className={`mt-auto fw-bold ${kpiData.avgMonthlyNetFlow >= 0 ? 'text-primary' : 'text-warning'}`}>
              {formatCurrencyMxn(kpiData.avgMonthlyNetFlow)}
            </h4>
            <small className="text-muted">Estimado últimos 6 meses</small>
          </Card.Body>
        </Card>
      </Col>
      <Col md={6} lg={3}>
        <Card className="shadow-sm h-100 border-start border-info border-4">
          <Card.Body className="d-flex flex-column">
            <Card.Title className="text-info mb-1"><FaHandHoldingUsd className="me-2" />Autonomía Financiera</Card.Title>
            <h4 className="mt-auto fw-bold">{kpiData.runwayMonths.toFixed(1)} meses</h4>
            <small className="text-muted">Operación sin nuevos ingresos (Burn Rate: {formatCurrencyMxn(Math.abs(kpiData.burnRate))}/mes)</small>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

const CashFlowChart = () => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = cashFlowData.find(d => d.month === label);
      return (
        <div className="custom-tooltip bg-white p-2 shadow rounded border">
          <p className="label fw-bold">{`${label}`}</p>
          {payload.map((pld: any, index: number) => (
            <p key={index} style={{ color: pld.color, margin: '0.25rem 0' }}>
              {`${pld.name}: ${formatCurrencyMxn(pld.value)}`}
            </p>
          ))}
          {dataPoint?.evento && <p className="event mt-1 mb-0 pt-1 border-top"><Badge bg="info" pill>Evento</Badge> {dataPoint.evento}</p>}
          {dataPoint?.eventoCritico && <p className="event mt-1 mb-0 pt-1 border-top"><Badge bg="danger" pill>Crítico</Badge> {dataPoint.eventoCritico}</p>}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <h5 className="card-subtitle mb-2 text-muted">Evolución Proyectada vs. Real (MXN)</h5>
      <ResponsiveContainer width="100%" height={380}>
        <LineChart data={cashFlowData} margin={{ top: 5, right: 20, left: 5, bottom: 40 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
          <XAxis dataKey="month" angle={-30} textAnchor="end" height={60} interval={0} tick={{fontSize: '0.8rem'}}/>
          <YAxis tickFormatter={(value) => `${Number(value)/1000}k`} tick={{fontSize: '0.8rem'}}/>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" wrapperStyle={{paddingBottom: '10px'}}/>
          <Line type="monotone" dataKey="flujoProyectado" stroke="#0d6efd" strokeWidth={2.5} name="Flujo Proyectado" activeDot={{ r: 7 }} dot={{r:4}} />
          <Line type="monotone" dataKey="flujoReal" stroke="#198754" strokeWidth={2.5} name="Flujo Real (Histórico)" activeDot={{ r: 7 }} dot={{r:4}} connectNulls={false} />
           {/* Líneas adicionales conceptuales */}
          <Line type="monotone" dataKey="ingresosProyectados" stroke="#adb5bd" strokeDasharray="5 5" name="Ingresos Proy. (Info)" activeDot={{ r: 6 }} dot={{r:3}} legendType="none" />
          <Line type="monotone" dataKey="egresosProyectados" stroke="#ffc107" strokeDasharray="5 5" name="Egresos Proy. (Info)" activeDot={{ r: 6 }} dot={{r:3}} legendType="none" />
        </LineChart>
      </ResponsiveContainer>
      <div className="mt-3">
        <h6 className="small text-muted">Eventos Clave del Periodo:</h6>
        <ListGroup variant="flush" className="small">
            {cashFlowData.filter(d => d.evento || d.eventoCritico).map(d => (
            <ListGroup.Item key={d.month} className="px-0 py-1 d-flex align-items-center">
                <Badge bg={d.eventoCritico ? "danger" : "primary"} pill className="me-2">{d.month}</Badge> 
                {d.eventoCritico ? d.eventoCritico : d.evento}
            </ListGroup.Item>
            ))}
        </ListGroup>
      </div>
    </>
  );
};

const ModelingFactors = () => {
  const iconMap: { [key: string]: React.ElementType } = {
    datosHistoricos: FaClock,
    patronesEstacionales: FaCalendarWeek,
    eventosMercadoLocal: FaStore,
    condicionesEconomicasMacro: FaUniversity,
    factoresInternosNegocio: FaIndustry
  };

  return (
    <>
      <p className="mb-3 small">
        El modelo predictivo integra una gama de factores para asegurar la precisión del pronóstico. Estos se agrupan en:
      </p>
      <Accordion flush defaultActiveKey="0">
        {Object.entries(modelingInputs).map(([key, factors], index) => {
          const IconComponent = iconMap[key] || FaFlask;
          return (
            <Accordion.Item eventKey={String(index)} key={key} className="mb-2 border rounded">
              <Accordion.Header>
                <IconComponent className="me-2 text-primary" size="1.1em"/>
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Accordion.Header>
              <Accordion.Body className="p-2">
                <ListGroup variant="flush" className="small">
                  {factors.map((factor, i) => (
                    <ListGroup.Item key={i} className="d-flex align-items-start py-1 px-1 border-0">
                      <Badge pill bg="secondary" className="me-2 mt-1 fw-normal" style={{fontSize: '0.7em'}}>{(i + 1)}</Badge>
                      {factor}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Accordion.Body>
            </Accordion.Item>
          );
        })}
      </Accordion>
      <Card.Text className="mt-3 fst-italic small">
        La relevancia de cada factor se ajusta dinámicamente para optimizar la precisión del pronóstico.
      </Card.Text>
    </>
  );
};

const AlertsDisplay = () => {
  const getAlertVariant = (severity: string) => {
    if (severity === 'danger') return 'danger';
    if (severity === 'warning') return 'warning';
    return 'info';
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="mb-0 small">Alertas generadas por el sistema para anticipar eventos y oportunidades.</p>
        <div>
          <Badge bg="danger" className="me-1" pill>{kpiData.alertsCount.critical} Críticas</Badge>
          <Badge bg="warning" text="dark" className="me-1" pill>{kpiData.alertsCount.warning} Avisos</Badge>
          <Badge bg="info" pill>{kpiData.alertsCount.info} Info</Badge>
        </div>
      </div>
      {predictiveAlertsData.length === 0 && <Alert variant="light" className="text-center py-3">No hay alertas activas en este momento.</Alert>}
      {predictiveAlertsData.map(alert => {
        const IconComponent = alert.icon;
        return (
          <Alert key={alert.id} variant={getAlertVariant(alert.severity)} className="shadow-sm mb-3 border-start border-5" style={{borderColor: `var(--bs-${getAlertVariant(alert.severity)}) !important`}}>
            <Alert.Heading className="h6">
              <IconComponent className={`me-2 text-${getAlertVariant(alert.severity)}`} size="1.2em"/>{alert.title}
            </Alert.Heading>
            <p className="mb-2 small">{alert.message}</p>
            {alert.actionableSteps && alert.actionableSteps.length > 0 && (
              <>
                <hr className="my-2"/>
                <p className="mb-1 small"><strong>Acciones Sugeridas:</strong></p>
                <ul className="mb-0 ps-4 small" style={{listStyleType: 'disc'}}>
                  {alert.actionableSteps.map((step, i) => <li key={i}>{step}</li>)}
                </ul>
              </>
            )}
            <hr className="my-2"/>
            <small className="text-muted">Generada: {new Date(alert.timestamp).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short' })}</small>
          </Alert>
        );
      })}
    </>
  );
};

const ExperimentalDisclaimer = () => (
  <Alert variant="secondary" className="mt-0 mb-4 shadow-sm border-warning border-2">
    <FaExclamationTriangle className="me-2 text-warning" />
    <strong>IMPORTANTE:</strong> Este es un sistema de pronóstico financiero experimental. Los resultados son estimaciones y <b>no constituyen asesoramiento financiero profesional</b>. Consulte con un experto antes de tomar decisiones críticas.
  </Alert>
);

const EnhancedCashFlowDashboard = () => {
  return (
    <Container fluid className="py-4 px-lg-4 px-md-3 px-2" style={{ backgroundColor: '#f4f6f9', fontFamily: "'Inter', sans-serif" }}>
      <Row className="justify-content-between align-items-center mb-4">
        <Col md="auto">
          <h1 className="display-6 fw-light mb-0"><FaChartLine className="me-2 text-primary"/>Pronóstico de Flujo de Efectivo</h1>
          <p className="lead text-muted small mb-0">Análisis predictivo para la MIPYME. Usuario: {USUARIO_ACTUAL}</p>
        </Col>
        <Col md="auto" className="text-md-end mt-2 mt-md-0">
            <small className="text-muted">Última Actualización de Datos: {new Date(FECHA_ACTUAL_UTC).toLocaleString('es-MX', {dateStyle:'long', timeStyle:'short'})} UTC</small>
        </Col>
      </Row>
      
      <ExperimentalDisclaimer />
      <KPISection />

      <Row className="g-4">
        <Col xl={7} lg={12} className="mb-4 mb-xl-0">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5" className="bg-white border-bottom py-3">
              <FaChartLine className="me-2 text-primary"/>Pronóstico de Flujo de Efectivo (MXN)
            </Card.Header>
            <Card.Body className="p-2 p-sm-3">
              <CashFlowChart />
            </Card.Body>
          </Card>
        </Col>
        <Col xl={5} lg={12}>
           <Card className="shadow-sm mb-4">
            <Card.Header as="h5" className="bg-white border-bottom py-3">
              <FaFlask className="me-2 text-info"/>Factores del Modelo Predictivo
            </Card.Header>
            <Card.Body className="p-2 p-sm-3">
              <ModelingFactors />
            </Card.Body>
             <Card.Footer className="text-muted small py-2">
               <FaLightbulb className="me-1 text-warning"/><strong>Clave:</strong> Históricos, Estacionalidad, Eventos, Economía, Internos.
            </Card.Footer>
          </Card>
           <Card className="shadow-sm">
            <Card.Header as="h5" className="bg-white border-bottom py-3">
              Alertas y Recomendaciones del Sistema
            </Card.Header>
            <Card.Body className="p-2 p-sm-3" style={{maxHeight: '450px', overflowY: 'auto'}}>
              <AlertsDisplay />
            </Card.Body>
            <Card.Footer className="text-muted small py-2">
                <FaShieldAlt className="me-1 text-success"/><strong>Objetivo:</strong> Anticipar riesgos y capitalizar oportunidades.
            </Card.Footer>
           </Card>
        </Col>
      </Row>
      <style type="text/css">
        {`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        .card-header h5, .card-header .h5 { margin-bottom: 0; font-weight: 500; font-size: 1.1rem; }
        .accordion-button:not(.collapsed) { color: #0056b3; background-color: #e7f1ff; box-shadow: inset 0 -1px 0 rgba(0,0,0,.125); }
        .accordion-button:focus { box-shadow: 0 0 0 0.25rem rgba(13,110,253,.25); }
        .display-6 { font-weight: 300 !important; }
        .border-start.border-4 { border-left-width: 4px !important; }
        .custom-tooltip { font-size: 0.85rem; }
        .custom-tooltip .label { font-size: 0.9rem; }
        .alert-heading.h6 { font-weight: 600; font-size: 1rem; }
        .table-responsive { overflow-x: auto; } /* Ensure horizontal scroll on small screens if table is too wide */
        `}
      </style>
    </Container>
  );
};

export default EnhancedCashFlowDashboard;

// Helper function (already defined, just for context)
// const formatCurrencyMxn = (value: number | bigint) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(value));