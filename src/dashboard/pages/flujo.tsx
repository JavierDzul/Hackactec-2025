import React from 'react';
import { Container, Row, Col, Card, ListGroup, Alert, Badge, Accordion } from 'react-bootstrap';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Datos Simulados Mejorados ---

const kpiData = {
  currentBalance: 125670.50,
  nextCriticalDate: '2025-07-15',
  criticalReason: 'Pago importante a proveedor',
  avgMonthlyNetFlow: 7500.00,
  burnRate: -2500.00,
  alertsCount: { critical: 1, warning: 2, info: 1 }
};

const cashFlowData = [
  { month: 'Ene', flujoProyectado: 45000, flujoReal: 46500 },
  { month: 'Feb', flujoProyectado: 42000, flujoReal: 41500 },
  { month: 'Mar', flujoProyectado: 50000, flujoReal: 51200 },
  { month: 'Abr', flujoProyectado: 35000, flujoReal: 33800, evento: 'Inicio Temporada Baja' },
  { month: 'May', flujoProyectado: 38000, flujoReal: 39500 },
  { month: 'Jun', flujoProyectado: 55000, flujoReal: 53800, evento: 'Festival Anual' },
  { month: 'Jul', flujoProyectado: 48000, flujoReal: null },
  { month: 'Ago', flujoProyectado: 47000, flujoReal: null },
  { month: 'Sep', flujoProyectado: 52000, flujoReal: null },
  { month: 'Oct', flujoProyectado: 58000, flujoReal: null, evento: 'Pico Turístico Otoño' },
  { month: 'Nov', flujoProyectado: 40000, flujoReal: null },
  { month: 'Dic', flujoProyectado: 65000, flujoReal: null, evento: 'Temporada Navideña' },
];

const predictiveAlertsData = [
  { 
    id: 1, 
    severity: 'danger',
    icon: 'bi-exclamation-triangle-fill',
    title: 'Alerta Crítica: Riesgo de Déficit de Liquidez',
    message: 'Se proyecta un déficit de liquidez significativo para el 15 de Julio (-$15,200) debido al pago programado al proveedor "Tech Solutions LLC". El flujo de caja actual no cubrirá este egreso.',
    timestamp: '2025-06-10 08:30:00',
    actionableSteps: [
      'Renegociar plazo de pago con Tech Solutions LLC.',
      'Evaluar acceso a línea de crédito a corto plazo.',
      'Intensificar esfuerzos de cobro a clientes con facturas vencidas.'
    ]
  },
  { 
    id: 2, 
    severity: 'warning', 
    icon: 'bi-exclamation-circle-fill',
    title: 'Aviso: Descenso en Ingresos por Temporada Baja',
    message: 'Los ingresos proyectados para Abril y Mayo muestran una disminución del 25% respecto al promedio debido a la temporada baja turística. Se recomienda ajustar gastos operativos.',
    timestamp: '2025-03-20 14:00:00',
    actionableSteps: [
      'Revisar y reducir gastos no esenciales.',
      'Lanzar promociones para atraer clientela local.',
      'Explorar diversificación de servicios para temporada baja.'
    ]
  },
  { 
    id: 3, 
    severity: 'info', 
    icon: 'bi-info-circle-fill',
    title: 'Oportunidad: Incremento de Flujo por Evento Local',
    message: 'Se espera un aumento del 15-20% en el flujo de efectivo durante Junio gracias al "Festival Anual de la Ciudad". Planifique inventario y personal adicional.',
    timestamp: '2025-05-15 11:00:00',
    actionableSteps: [
      'Confirmar participación y promociones especiales para el festival.',
      'Asegurar stock suficiente de productos/servicios de alta demanda.',
      'Programar personal extra para cubrir el aumento de actividad.'
    ]
  }
];

const modelingInputs = {
  historicalData: [
    "Flujo de caja de los últimos 3 años",
    "Ventas por producto/servicio",
    "Costos operativos detallados (fijos y variables)",
    "Ciclos de cobro y pago"
  ],
  seasonalPatterns: [
    "Análisis de temporadas turísticas (alta, media, baja)",
    "Impacto de festividades y vacaciones escolares",
    "Variaciones climáticas estacionales"
  ],
  marketEvents: [
    "Calendario de eventos culturales y deportivos locales/regionales",
    "Ferias y congresos sectoriales",
    "Lanzamiento de productos/servicios de la competencia"
  ],
  economicIndicators: [
    "Tasas de inflación y de interés",
    "Índices de confianza del consumidor",
    "Pronósticos de crecimiento sectorial"
  ],
  meteorologicalFactors: [
    "Pronósticos a corto y mediano plazo",
    "Alertas por fenómenos meteorológicos extremos (si aplica al negocio)",
    "Impacto histórico del clima en la demanda"
  ]
};

const KPISection = () => {
  const formatCurrency = (value) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(value);
  
  return (
    <Row className="mb-4">
      <Col md={4} className="mb-3">
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title><i className="bi bi-cash-coin me-2 text-success"></i>Saldo Actual</Card.Title>
            <h3 className="text-success">{formatCurrency(kpiData.currentBalance)}</h3>
            <small className="text-muted">Actualizado: {new Date().toLocaleDateString()}</small>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4} className="mb-3">
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title><i className="bi bi-calendar-event me-2 text-danger"></i>Próximo Punto Crítico</Card.Title>
            <h4>{kpiData.nextCriticalDate}</h4>
            <p className="mb-0 text-danger"><small>{kpiData.criticalReason}</small></p>
          </Card.Body>
        </Card>
      </Col>
      <Col md={4} className="mb-3">
        <Card className="shadow-sm h-100">
          <Card.Body>
            <Card.Title>
              <i className={`bi ${kpiData.avgMonthlyNetFlow >= 0 ? 'bi-graph-up-arrow text-primary' : 'bi-graph-down-arrow text-warning'} me-2`}></i>
              Flujo Neto Prom. Mensual
            </Card.Title>
            <h4 className={kpiData.avgMonthlyNetFlow >= 0 ? 'text-primary' : 'text-warning'}>
              {formatCurrency(kpiData.avgMonthlyNetFlow)}
            </h4>
            <small className="text-muted">Últimos 6 meses</small>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

const formatCurrencyTooltip = (value) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(Number(value));

const CashFlowChart = () => {
  return (
    <>
      <h5 className="card-subtitle mb-2 text-muted">Evolución Proyectada vs. Real (Últimos y Próximos Meses)</h5>
      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={cashFlowData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={formatCurrencyTooltip} />
          <Tooltip formatter={formatCurrencyTooltip} />
          <Legend verticalAlign="top" height={36}/>
          <Line type="monotone" dataKey="flujoProyectado" stroke="#8884d8" strokeWidth={2} name="Flujo Proyectado" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="flujoReal" stroke="#82ca9d" strokeWidth={2} name="Flujo Real" activeDot={{ r: 8 }} />
        </LineChart>
      </ResponsiveContainer>
      <ListGroup variant="flush" className="mt-3">
        {cashFlowData.filter(d => d.evento).map(d => (
          <ListGroup.Item key={d.month} className="px-0 py-1">
            <Badge bg="info" pill className="me-2">{d.month}</Badge> {d.evento}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </>
  );
};

const ModelingFactors = () => {
  return (
    <>
      <p className="mb-3">
        El modelo predictivo integra una amplia gama de factores para asegurar la precisión del pronóstico. Estos se agrupan en las siguientes categorías:
      </p>
      <Accordion defaultActiveKey="0">
        {Object.entries(modelingInputs).map(([key, factors], index) => (
          <Accordion.Item eventKey={String(index)} key={key}>
            <Accordion.Header>
              <i className={`bi bi-${key === 'historicalData' ? 'clock-history' : key === 'seasonalPatterns' ? 'calendar3-week' : key === 'marketEvents' ? 'megaphone' : key === 'economicIndicators' ? 'graph-up' : 'cloud-sun'} me-2`}></i>
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </Accordion.Header>
            <Accordion.Body>
              <ListGroup variant="flush">
                {factors.map((factor, i) => (
                  <ListGroup.Item key={i} className="d-flex align-items-start">
                    <Badge pill bg="secondary" className="me-2 mt-1">{(i + 1)}</Badge>
                    {factor}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Accordion.Body>
          </Accordion.Item>
        ))}
      </Accordion>
      <Card.Text className="mt-3 fst-italic">
        <small>La ponderación y relevancia de cada factor se ajusta dinámicamente mediante algoritmos de aprendizaje automático para optimizar la precisión del pronóstico.</small>
      </Card.Text>
    </>
  );
};

const AlertsDisplay = () => {
  const getAlertVariant = (severity) => {
    if (severity === 'danger') return 'danger';
    if (severity === 'warning') return 'warning';
    return 'info';
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="mb-0">Alertas generadas por el sistema para anticipar eventos críticos y oportunidades.</p>
        <div>
          <Badge bg="danger" className="me-1">{kpiData.alertsCount.critical} Críticas</Badge>
          <Badge bg="warning" text="dark" className="me-1">{kpiData.alertsCount.warning} Avisos</Badge>
          <Badge bg="info">{kpiData.alertsCount.info} Informativas</Badge>
        </div>
      </div>
      {predictiveAlertsData.length === 0 && <Alert variant="light">No hay alertas activas en este momento.</Alert>}
      {predictiveAlertsData.map(alert => (
        <Alert key={alert.id} variant={getAlertVariant(alert.severity)} className="shadow-sm mb-3">
          <Alert.Heading>
            <i className={`${alert.icon} me-2`}></i>{alert.title}
          </Alert.Heading>
          <p>{alert.message}</p>
          {alert.actionableSteps && alert.actionableSteps.length > 0 && (
            <>
              <hr />
              <p className="mb-1"><strong>Acciones Sugeridas:</strong></p>
              <ul className="mb-0 ps-4">
                {alert.actionableSteps.map((step, i) => <li key={i}><small>{step}</small></li>)}
              </ul>
            </>
          )}
          <hr />
          <small className="text-muted">Generada: {new Date(alert.timestamp).toLocaleString()}</small>
        </Alert>
      ))}
    </>
  );
};

// --- Disclaimer ---
const ExperimentalDisclaimer = () => (
  <Alert variant="secondary" className="mt-4 mb-4 shadow-sm border">
    <i className="bi bi-exclamation-diamond-fill me-2"></i>
    <strong>IMPORTANTE:</strong> Este dashboard utiliza tecnología experimental de pronóstico financiero basada en datos históricos, modelado avanzado y aprendizaje automático. Los resultados presentados son estimaciones y <b>no deben considerarse como asesoramiento financiero profesional</b>. <br />
    <b>Utilice la información bajo su propio juicio y responsabilidad.</b> Recomendamos consultar con expertos antes de tomar decisiones críticas basadas en estos pronósticos.
  </Alert>
);

// --- Componente Principal del Dashboard Mejorado ---
const EnhancedCashFlowDashboard = () => {
  return (
    <Container fluid className="py-4 px-md-4" style={{ backgroundColor: '#f8f9fa' }}>
      <Row className="justify-content-center mb-4">
        <Col md={12} className="text-center">
          <h1 className="display-5"><i className="bi bi-bar-chart-line-fill me-2"></i>Dashboard Avanzado de Flujo de Efectivo</h1>
          <p className="lead text-muted">Análisis predictivo y monitoreo en tiempo real para la toma de decisiones financieras estratégicas.</p>
        </Col>
      </Row>
      <Row>
        <Col>
          <ExperimentalDisclaimer />
        </Col>
      </Row>
      {/* Sección de KPIs */}
      <KPISection />

      <Row>
        {/* Columna Izquierda: Gráfico y Alertas */}
        <Col lg={7} className="mb-4">
          <Card className="shadow-sm h-100">
            <Card.Header as="h5" className="bg-primary text-white">
              <i className="bi bi-graph-up me-2"></i>Pronóstico de Flujo de Efectivo
            </Card.Header>
            <Card.Body>
              <CashFlowChart />
            </Card.Body>
          </Card>
        </Col>
        {/* Columna Derecha: Modelado y Alertas */}
        <Col lg={5} className="mb-4">
           <Card className="shadow-sm mb-4">
            <Card.Header as="h5" className="bg-info text-white">
              <i className="bi bi-cpu-fill me-2"></i>Modelado Basado en Patrones
            </Card.Header>
            <Card.Body>
              <ModelingFactors />
            </Card.Body>
             <Card.Footer className="text-muted small">
               <i className="bi bi-lightbulb me-1"></i><strong>Entradas Clave:</strong> Históricos, Estacionalidad, Eventos de Mercado, Indicadores Económicos, Meteorología.
            </Card.Footer>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col>
            <Card className="shadow-sm">
                <Card.Header as="h5" className="bg-warning text-dark">
                <i className="bi bi-bell-fill me-2"></i>Alertas Predictivas del Sistema
                </Card.Header>
                <Card.Body>
                <AlertsDisplay />
                </Card.Body>
                <Card.Footer className="text-muted small">
                    <i className="bi bi-shield-check me-1"></i><strong>Objetivo:</strong> Anticipar déficits, identificar oportunidades y mitigar riesgos financieros.
                </Card.Footer>
            </Card>
        </Col>
      </Row>
      <style type="text/css">
        {`
        .card-header i {
          font-size: 1.1rem;
        }
        .accordion-button:not(.collapsed) {
          color: #0c63e4;
          background-color: #e7f1ff;
        }
        .display-5 {
          font-weight: 300;
        }
        `}
      </style>
    </Container>
  );
};

export default EnhancedCashFlowDashboard;