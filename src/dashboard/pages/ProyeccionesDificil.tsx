import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card, Table, ProgressBar, Tabs, Tab, Accordion } from "react-bootstrap";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import { FaChartLine, FaBullseye, FaCog, FaPlusCircle, FaMinusCircle, FaEquals, FaExclamationTriangle, FaCheckCircle, FaBalanceScale } from 'react-icons/fa';

/**
 * DASHBOARD DE PROYECCIONES FINANCIERAS AVANZADO - DISEÑO PROFESIONAL
 * Interfaz reorganizada con Pestañas para configuración y Acordeón para detalles.
 * Paleta de colores sobria y profesional.
 * Meses mostrados con nombres completos.
 */

interface ProjectionResult {
  month: number;
  revenue: number;
  costs: number;
  taxes: number;
  profit: number;
}

interface ScenarioParams {
  label: string;
  baseRevenue: number;
  baseCosts: number;
  inventoryCosts: number;
  historicGrowthRate: number;
  touristInfluxIndex: number;
  localEventsWeight: number;
  inflationRate: number;
  taxRate: number;
  crisisActive: boolean;
  priceAdjustment: number;
  seasonalVariation: number;
}

// Nombres completos de los meses para visualización
const fullMonthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];


const FinancialProjectionDashboardRechartsPlusProfessional: React.FC = () => {
  const [projectionMonths, setProjectionMonths] = useState<number>(12);

  const [pessimisticScenario, setPessimisticScenario] = useState<ScenarioParams>({
    label: "Pesimista",
    baseRevenue: 150000,
    baseCosts: 110000,
    inventoryCosts: 25000,
    historicGrowthRate: 2,
    touristInfluxIndex: 80,
    localEventsWeight: 5,
    inflationRate: 6,
    taxRate: 16,
    crisisActive: false,
    priceAdjustment: -5,
    seasonalVariation: -10
  });

  const [realisticScenario, setRealisticScenario] = useState<ScenarioParams>({
    label: "Realista",
    baseRevenue: 200000,
    baseCosts: 120000,
    inventoryCosts: 30000,
    historicGrowthRate: 5,
    touristInfluxIndex: 100,
    localEventsWeight: 15,
    inflationRate: 4,
    taxRate: 16,
    crisisActive: false,
    priceAdjustment: 0,
    seasonalVariation: 0
  });

  const [optimisticScenario, setOptimisticScenario] = useState<ScenarioParams>({
    label: "Optimista",
    baseRevenue: 250000,
    baseCosts: 100000,
    inventoryCosts: 40000,
    historicGrowthRate: 8,
    touristInfluxIndex: 120,
    localEventsWeight: 20,
    inflationRate: 3,
    taxRate: 16,
    crisisActive: false,
    priceAdjustment: 10,
    seasonalVariation: 5
  });

  const computeScenario = (params: ScenarioParams): ProjectionResult[] => {
    const results: ProjectionResult[] = [];
    let currentRevenue = params.baseRevenue;
    let currentCosts = params.baseCosts + params.inventoryCosts;

    for (let i = 1; i <= projectionMonths; i++) {
      const growthMult = 1 + params.historicGrowthRate / 100;
      const priceMult = 1 + params.priceAdjustment / 100;
      currentRevenue = currentRevenue * growthMult * priceMult;
      currentCosts = currentCosts * (1 + params.inflationRate / 100);

      const tourismFactor = params.touristInfluxIndex / 100;
      const eventsFactor = params.localEventsWeight / 100;
      const seasonalFactor = 1 + params.seasonalVariation / 100;
      let adjustedRevenue = currentRevenue * tourismFactor * seasonalFactor;
      adjustedRevenue += currentRevenue * eventsFactor;

      const crisisPenalty = params.crisisActive ? adjustedRevenue * 0.15 : 0;
      const finalRevenue = adjustedRevenue - crisisPenalty;
      const taxValue = finalRevenue * (params.taxRate / 100);
      const profit = finalRevenue - (currentCosts + taxValue);

      results.push({
        month: i, // 1-indexed month number
        revenue: finalRevenue,
        costs: currentCosts,
        taxes: taxValue,
        profit
      });
    }
    return results;
  };

  const pessimisticData = computeScenario(pessimisticScenario);
  const realisticData = computeScenario(realisticScenario);
  const optimisticData = computeScenario(optimisticScenario);

  const calculateIndicators = (data: ProjectionResult[], scenario: ScenarioParams) => {
    const totalRevenue = data.reduce((acc, r) => acc + r.revenue, 0);
    const totalCosts = data.reduce((acc, r) => acc + r.costs, 0);
    const totalTaxes = data.reduce((acc, r) => acc + r.taxes, 0);
    const totalProfit = data.reduce((acc, r) => acc + r.profit, 0);
    const breakEvenMonthEntry = data.find((r) => r.profit >= 0);
    const breakEvenMonth = breakEvenMonthEntry ? breakEvenMonthEntry.month : null; // 1-indexed month number
    const initialInvestment = scenario.baseCosts + scenario.inventoryCosts;
    const roiPercentage = (initialInvestment > 0)
      ? (totalProfit / initialInvestment) * 100
      : 0;
    return { totalRevenue, totalCosts, totalTaxes, totalProfit, breakEvenMonth, roiPercentage };
  };

  const pessIndicators = calculateIndicators(pessimisticData, pessimisticScenario);
  const realIndicators = calculateIndicators(realisticData, realisticScenario);
  const optIndicators = calculateIndicators(optimisticData, optimisticScenario);

  const mergedChartData = realisticData.map((item, index) => ({ // index is 0-based
    month: fullMonthNames[index] || `Mes ${index + 1}`, // Use fullMonthNames
    pessProfit: Number(pessimisticData[index]?.profit.toFixed(2) || 0),
    realProfit: Number(realisticData[index]?.profit.toFixed(2) || 0),
    optProfit: Number(optimisticData[index]?.profit.toFixed(2) || 0),
  }));

  const getRecommendation = (profit: number, scenarioLabel: string): string => {
    if (profit < 0) return `${scenarioLabel}: ALERTA DE PÉRDIDAS. Es crucial una revisión inmediata de la estructura de costos y estrategias de precios. Considerar la optimización de gastos no esenciales y campañas de marketing de alto impacto y bajo costo.`;
    if (profit < 50000) return `${scenarioLabel}: MARGEN REDUCIDO. Se recomienda un análisis detallado de costos variables y fijos. Explorar la renegociación con proveedores y la implementación de promociones específicas para incrementar el volumen de ventas sin sacrificar excesivamente el margen.`;
    return `${scenarioLabel}: PROYECCIÓN SALUDABLE. Buen desempeño. Evaluar oportunidades de reinversión en tecnología, capacitación del personal o desarrollo de nuevos servicios para mantener una ventaja competitiva y fomentar el crecimiento sostenible.`;
  };

  const ScenarioFormControl: React.FC<{ scenario: ScenarioParams, setScenario: React.Dispatch<React.SetStateAction<ScenarioParams>> }> = ({ scenario, setScenario }) => (
    <Form>
      <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Ingresos Base (MXN)</Form.Label><Form.Control type="number" value={scenario.baseRevenue} onChange={(e) => setScenario({ ...scenario, baseRevenue: Number(e.target.value) })} /></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Costos Base (MXN)</Form.Label><Form.Control type="number" value={scenario.baseCosts} onChange={(e) => setScenario({ ...scenario, baseCosts: Number(e.target.value) })} /></Form.Group></Col>
      </Row>
      <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Inventario (MXN)</Form.Label><Form.Control type="number" value={scenario.inventoryCosts} onChange={(e) => setScenario({ ...scenario, inventoryCosts: Number(e.target.value) })} /></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Crec. Histórico (%)</Form.Label><Form.Control type="number" value={scenario.historicGrowthRate} onChange={(e) => setScenario({ ...scenario, historicGrowthRate: Number(e.target.value) })} /></Form.Group></Col>
      </Row>
      <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Afluencia Turística (%) [{scenario.touristInfluxIndex}%]</Form.Label><Form.Range min={0} max={200} value={scenario.touristInfluxIndex} onChange={(e) => setScenario({ ...scenario, touristInfluxIndex: Number(e.target.value) })} /></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Eventos Locales (%) [{scenario.localEventsWeight}%]</Form.Label><Form.Range min={0} max={100} value={scenario.localEventsWeight} onChange={(e) => setScenario({ ...scenario, localEventsWeight: Number(e.target.value) })} /></Form.Group></Col>
      </Row>
      <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Inflación (%)</Form.Label><Form.Control type="number" value={scenario.inflationRate} onChange={(e) => setScenario({ ...scenario, inflationRate: Number(e.target.value) })} /></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Impuesto (%)</Form.Label><Form.Control type="number" value={scenario.taxRate} onChange={(e) => setScenario({ ...scenario, taxRate: Number(e.target.value) })} /></Form.Group></Col>
      </Row>
      <Row>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Ajuste Precios (%)</Form.Label><Form.Control type="number" value={scenario.priceAdjustment} onChange={(e) => setScenario({ ...scenario, priceAdjustment: Number(e.target.value) })} /></Form.Group></Col>
        <Col md={6}><Form.Group className="mb-3"><Form.Label>Variación Estacional (%)</Form.Label><Form.Control type="number" value={scenario.seasonalVariation} onChange={(e) => setScenario({ ...scenario, seasonalVariation: Number(e.target.value) })} /></Form.Group></Col>
      </Row>
      <Form.Group className="mb-3"><Form.Check type="checkbox" label="Crisis Externa Activa" checked={scenario.crisisActive} onChange={(e) => setScenario({ ...scenario, crisisActive: e.target.checked })} /></Form.Group>
    </Form>
  );

  const IndicatorCard: React.FC<{ title: string; indicators: any; icon: React.ReactNode; borderColor: string }> = ({ title, indicators, icon, borderColor }) => (
    <Card className="h-100 shadow-sm" style={{ borderLeft: `5px solid ${borderColor}` }}>
      <Card.Body>
        <Card.Title as="h5" className="d-flex align-items-center" style={{ fontWeight: '600', color: "#343a40" }}>
          {icon} <span className="ms-2">{title}</span>
        </Card.Title>
        <hr style={{ borderColor: 'rgba(0,0,0,0.1)'}}/>
        <p className="mb-1"><strong>Utilidad Total:</strong> <span style={{color: indicators.totalProfit >= 0 ? '#28a745' : '#dc3545', fontWeight: '500'}}>${indicators.totalProfit.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
        <p className="mb-1"><strong>Mes de Equilibrio:</strong> {indicators.breakEvenMonth ? fullMonthNames[indicators.breakEvenMonth - 1] || `Mes ${indicators.breakEvenMonth}` : "No alcanzado"}</p>
        <p className="mb-0"><strong>ROI Estimado:</strong> {indicators.roiPercentage.toFixed(2)}%</p>
      </Card.Body>
    </Card>
  );

  return (
    <Container fluid style={{ padding: "2rem", backgroundColor: "#e9ecef" }}>
      <Row className="mb-4">
        <Col>
          <h1 style={{ color: "#212529", fontWeight: "bold", borderBottom: "3px solid #007bff", paddingBottom: "0.5rem" }}>
            <FaChartLine style={{ marginRight: "15px", color: "#007bff" }} />
           Proyecciones Financieras Avanzadas
          </h1>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4} className="d-flex">
          <Card className="shadow-sm w-100">
            <Card.Header as="h5" className="bg-light text-dark">
              <FaCog style={{ marginRight: "10px" }} />
              Configuraciones Globales
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: "500" }}>Meses a Proyectar</Form.Label>
                <Form.Control type="number" value={projectionMonths} onChange={(e) => setProjectionMonths(Number(e.target.value))} min="1" max="12" /> {/* Limitado a 12 por fullMonthNames */}
              </Form.Group>
              <Button variant="outline-primary" className="w-100">
                Actualizar Proyecciones
              </Button>
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Row>
            <Col md={4} className="mb-3 mb-md-0 d-flex">
                <IndicatorCard title="Escenario Pesimista" indicators={pessIndicators} icon={<FaExclamationTriangle className="text-danger me-2" size="1.2em"/>} borderColor="#dc3545" />
            </Col>
            <Col md={4} className="mb-3 mb-md-0 d-flex">
                <IndicatorCard title="Escenario Realista" indicators={realIndicators} icon={<FaBalanceScale className="text-primary me-2" size="1.2em"/>} borderColor="#007bff" />
            </Col>
            <Col md={4} className="d-flex">
                <IndicatorCard title="Escenario Optimista" indicators={optIndicators} icon={<FaCheckCircle className="text-success me-2" size="1.2em"/>} borderColor="#28a745" />
            </Col>
          </Row>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h4 style={{ margin: 0, fontWeight: "600", color: "#343a40" }}>Configuración Detallada de Escenarios</h4>
            </Card.Header>
            <Tabs defaultActiveKey="realistic" id="scenario-tabs" className="mb-0 nav-tabs-professional" fill>
              <Tab eventKey="pessimistic" title={<span style={{ fontWeight: '500' }}><FaMinusCircle className="me-2" /> Pesimista</span>}>
                <Card.Body style={{ backgroundColor: "#ffffff" }}>
                  <ScenarioFormControl scenario={pessimisticScenario} setScenario={setPessimisticScenario} />
                </Card.Body>
              </Tab>
              <Tab eventKey="realistic" title={<span style={{ fontWeight: '500' }}><FaEquals className="me-2" /> Realista</span>}>
                <Card.Body style={{ backgroundColor: "#ffffff" }}>
                  <ScenarioFormControl scenario={realisticScenario} setScenario={setRealisticScenario} />
                </Card.Body>
              </Tab>
              <Tab eventKey="optimistic" title={<span style={{ fontWeight: '500' }}><FaPlusCircle className="me-2" /> Optimista</span>}>
                <Card.Body style={{ backgroundColor: "#ffffff" }}>
                  <ScenarioFormControl scenario={optimisticScenario} setScenario={setOptimisticScenario} />
                </Card.Body>
              </Tab>
            </Tabs>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header as="h5" className="bg-dark text-white">
              <FaBullseye style={{ marginRight: "10px" }} />
              Comparativa de Utilidades Proyectadas
            </Card.Header>
            <Card.Body style={{ height: "500px", backgroundColor: "white" }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ced4da" />
                  <XAxis dataKey="month" stroke="#495057" />
                  <YAxis stroke="#495057" tickFormatter={(value) => `$${value.toLocaleString()}`} />
                  <Tooltip formatter={(value: number) => [`$${value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Utilidad"]} />
                  <Legend />
                  <Line type="monotone" dataKey="pessProfit" stroke="#dc3545" strokeWidth={2} name="Utilidad Pesimista" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="realProfit" stroke="#007bff" strokeWidth={2} name="Utilidad Realista" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="optProfit" stroke="#28a745" strokeWidth={2} name="Utilidad Optimista" dot={{ r: 3 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col>
          <Accordion defaultActiveKey="1" alwaysOpen>
            {[
              { eventKey: "0", title: "Pesimista", data: pessimisticData, indicators: pessIndicators, scenario: pessimisticScenario, headerBg: "#f8d7da", headerColor: "#721c24", borderColorAcc: "#f5c6cb" },
              { eventKey: "1", title: "Realista", data: realisticData, indicators: realIndicators, scenario: realisticScenario, headerBg: "#cce5ff", headerColor: "#004085", borderColorAcc: "#b8daff" },
              { eventKey: "2", title: "Optimista", data: optimisticData, indicators: optIndicators, scenario: optimisticScenario, headerBg: "#d4edda", headerColor: "#155724", borderColorAcc: "#c3e6cb" }
            ].map(item => (
              <Accordion.Item eventKey={item.eventKey} key={item.eventKey} className="mb-3 shadow-sm" style={{border: `1px solid ${item.borderColorAcc}`}}>
                <Accordion.Header className="accordion-header-professional">
                  Detalle y Recomendación - Escenario {item.title}
                </Accordion.Header>
                <Accordion.Body style={{ backgroundColor: "#ffffff" }}>
                  <h5 style={{color: "#343a40", fontWeight: '600'}}>Tabla de Proyección Mensual</h5>
                  <div style={{ maxHeight: "300px", overflowY: "auto", marginBottom: "1rem" }}>
                    <Table striped bordered hover size="sm" responsive>
                      <thead className="table-light">
                        <tr>
                          <th>Mes</th><th>Ingreso</th><th>Costos</th><th>Impuestos</th><th>Utilidad</th>
                        </tr>
                      </thead>
                      <tbody>
                        {item.data.map((r, idx) => ( // r.month is 1-indexed
                          <tr key={idx}>
                            <td>{fullMonthNames[r.month - 1] || `Mes ${r.month}`}</td>
                            <td>${r.revenue.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                            <td>${r.costs.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                            <td>${r.taxes.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</td>
                            <td style={{ color: r.profit < 0 ? "#dc3545" : "#28a745", fontWeight: "500" }}>
                              ${r.profit.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  <h5 style={{color: "#343a40", fontWeight: '600', marginTop: '1rem'}}>Análisis y Recomendación</h5>
                  <Card.Text style={{ color: '#495057', fontSize: '0.95rem' }}>
                    {getRecommendation(item.indicators.totalProfit, item.scenario.label)}
                  </Card.Text>
                  <ProgressBar className="mt-2" style={{height: '22px', fontSize: '0.85rem'}}>
                    <ProgressBar 
                        variant={item.indicators.totalProfit < 0 ? "danger" : "success"}
                        now={
                            item.indicators.totalProfit < 0 ? 100 : 
                            Math.min((item.indicators.totalProfit / (item.indicators.totalRevenue + 0.0001)) * 100, 100)
                        }
                        label={
                            item.indicators.totalProfit < 0 ? `PÉRDIDA` :
                            `Margen Neto: ${Math.min((item.indicators.totalProfit / (item.indicators.totalRevenue + 0.0001)) * 100, 100).toFixed(1)}%`
                        }
                        key={1}
                    />
                  </ProgressBar>
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Col>
      </Row>
      <style type="text/css">
        {`
          .nav-tabs-professional .nav-link {
            color: #495057; 
            border: 1px solid #dee2e6;
            border-bottom: none; 
            margin-right: 2px;
            background-color: #f8f9fa; 
          }
          .nav-tabs-professional .nav-link.active {
            color: #007bff; 
            background-color: #ffffff; 
            border-color: #dee2e6 #dee2e6 #ffffff; 
            font-weight: bold;
          }
          .nav-tabs-professional .nav-link:hover {
            border-color: #e9ecef #e9ecef #dee2e6;
            background-color: #e9ecef; 
          }
          .accordion-header-professional button { 
            background-color: #f8f9fa;
            color: #212529;
            font-weight: 600;
            border: none; 
          }
          .accordion-header-professional button:not(.collapsed) {
            background-color: #007bff; 
            color: white;
          }
          .accordion-header-professional button:focus {
            box-shadow: none;
          }
          .accordion-item {
            border-radius: .25rem; 
            overflow: hidden; 
          }
          .card-header {
            border-bottom: 1px solid rgba(0,0,0,.125); 
          }
          hr {
            border-top: 1px solid rgba(0,0,0,.1); 
          }
        `}
      </style>
    </Container>
  );
};

export default FinancialProjectionDashboardRechartsPlusProfessional;
