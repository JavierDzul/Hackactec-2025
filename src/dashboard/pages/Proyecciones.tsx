import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Table,
  ProgressBar,
  Collapse
} from "react-bootstrap";
import {
  FaBusAlt,
  FaAngleDown,
  FaAngleUp,
  FaInfoCircle,
  FaLightbulb,
  FaChartLine,
  FaMoneyBillWave,
  FaUsers
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";

// -----------------------------------------------------------------
// Dashboard de Proyección Financiera para Microempresa de Tours
// -----------------------------------------------------------------

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
  guideCosts: number;
  fleetMaintenance: number;
  marketingBudget: number;
  competitorEffect: number;
  expansionPlanActive: boolean;
  historicGrowthRate: number;
  touristInfluxIndex: number;
  localEventsWeight: number;
  inflationRate: number;
  taxRate: number;
  crisisActive: boolean;
  priceAdjustment: number;
  seasonalVariation: number;
  ignoreInflation: boolean;
  ignoreCrisis: boolean;
  discountRate: number;
  currency?: string;
}

/**
 * Añade "ruido" aleatorio (aprox. -10% a +10%) a un valor dado.
 */
const addNoise = (value: number) => {
  const noisePercentage = Math.random() * 0.2 - 0.1;
  return value * (1 + noisePercentage);
};

/**
 * Nombres de los meses para visualización.
 */
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

/**
 * Noticias y consejos relevantes para el sector turístico.
 */
const newsAndTips = [
  {
    icon: <FaUsers style={{ color: "#2563eb", marginRight: "8px" }} />,
    title: "Nueva Campaña Turística Nacional",
    detail: "El gobierno ha lanzado una fuerte campaña para promover el turismo interno, esperando un aumento del 15% en visitantes nacionales.",
    advice: "Crea paquetes para familias y turistas locales. Usa las redes sociales con los hashtags de la campaña oficial para mayor visibilidad."
  },
  {
    icon: <FaLightbulb style={{ color: "#f59e0b", marginRight: "8px" }} />,
    title: "Festival Gastronómico Regional en Dos Meses",
    detail: "Se espera que el próximo festival gastronómico atraiga a miles de personas. Los tours culinarios y culturales suelen tener alta demanda.",
    advice: "Diseña tours especiales para el festival. Considera alianzas con restaurantes o chefs para ofrecer experiencias únicas. ¡Prepara tu logística de transporte!"
  },
  {
    icon: <FaMoneyBillWave style={{ color: "#dc2626", marginRight: "8px" }} />,
    title: "Competencia Agresiva con Descuentos",
    detail: "Varios competidores están ofreciendo descuentos de hasta 20% para grupos grandes y reservaciones anticipadas.",
    advice: "Analiza si puedes ofrecer descuentos similares o, mejor aún, añade valor extra a tus tours (un guía experto, un recuerdo, una parada exclusiva) para justificar tu precio."
  },
  {
    icon: <FaChartLine style={{ color: "#16a34a", marginRight: "8px" }} />,
    title: "Alza en el Costo de Combustibles",
    detail: "Se prevé un aumento del 8% en el precio de la gasolina el próximo mes, lo que impactará los costos de transporte.",
    advice: "Optimiza tus rutas para ahorrar combustible. Comunica con transparencia a tus clientes si necesitas hacer un pequeño ajuste en los precios de tours más largos."
  }
];

const FinancialProjectionDashboardToursFinal: React.FC = () => {
  const [projectionMonths, setProjectionMonths] = useState<number>(12);

  // Parámetros del escenario
  const [baseScenario, setBaseScenario] = useState<ScenarioParams>({
    label: "Realista",
    baseRevenue: addNoise(120000),
    baseCosts: addNoise(55000),
    guideCosts: addNoise(18000),
    fleetMaintenance: addNoise(10000),
    marketingBudget: addNoise(8000),
    competitorEffect: -5,
    expansionPlanActive: false,
    historicGrowthRate: 7,
    touristInfluxIndex: 115,
    localEventsWeight: 10,
    inflationRate: 3,
    taxRate: 16,
    crisisActive: false,
    priceAdjustment: 2,
    seasonalVariation: 0,
    ignoreInflation: false,
    ignoreCrisis: false,
    discountRate: 5,
    currency: "MXN"
  });

  // Estados de visibilidad para las secciones colapsables
  const [showParameters, setShowParameters] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [showNews, setShowNews] = useState<boolean>(true);

  // Re-aleatorizar ciertos campos al montar el componente
  useEffect(() => {
    setBaseScenario((prev) => ({
      ...prev,
      baseRevenue: addNoise(120000),
      baseCosts: addNoise(55000),
      guideCosts: addNoise(18000),
      fleetMaintenance: addNoise(10000),
      marketingBudget: addNoise(8000)
    }));
  }, []);

  /**
   * Calcula la proyección financiera basada en los parámetros.
   */
  const computeProjection = (params: ScenarioParams): ProjectionResult[] => {
    const results: ProjectionResult[] = [];
    let currentRevenue = addNoise(params.baseRevenue);
    let currentCosts =
      addNoise(params.baseCosts) +
      addNoise(params.guideCosts) +
      addNoise(params.fleetMaintenance) +
      addNoise(params.marketingBudget);

    for (let i = 1; i <= projectionMonths; i++) {
      const growthMult = 1 + params.historicGrowthRate / 100;
      const priceMult = 1 + params.priceAdjustment / 100;
      currentRevenue *= growthMult * priceMult;
      currentRevenue += (params.competitorEffect / 100) * currentRevenue;

      if (params.expansionPlanActive) currentRevenue *= 1.1;
      if (!params.ignoreInflation) currentCosts *= 1 + params.inflationRate / 100;

      const finalDiscount = 1 - params.discountRate / 100;
      let adjustedRevenue = currentRevenue * finalDiscount;

      const tourismFactor = params.touristInfluxIndex / 100;
      const eventsFactor = params.localEventsWeight / 100;
      const seasonalFactor = 1 + params.seasonalVariation / 100;
      adjustedRevenue *= tourismFactor * seasonalFactor;
      adjustedRevenue += currentRevenue * eventsFactor; // Asumiendo que el peso de eventos se suma al revenue ajustado por turismo/estacionalidad.

      if (params.crisisActive && !params.ignoreCrisis) adjustedRevenue *= 0.85; // -15%

      adjustedRevenue = addNoise(adjustedRevenue);
      const finalCost = addNoise(currentCosts);
      const taxValue = adjustedRevenue * (params.taxRate / 100);
      const profit = adjustedRevenue - (finalCost + taxValue);

      results.push({
        month: i,
        revenue: adjustedRevenue,
        costs: finalCost,
        taxes: taxValue,
        profit
      });
    }
    return results;
  };

  const scenarioData = computeProjection(baseScenario);

  // Totales
  const totalRevenue = scenarioData.reduce((acc, r) => acc + r.revenue, 0);
  const totalCosts = scenarioData.reduce((acc, r) => acc + r.costs, 0);
  const totalTaxes = scenarioData.reduce((acc, r) => acc + r.taxes, 0);
  const totalProfit = scenarioData.reduce((acc, r) => acc + r.profit, 0);

  // Datos para la gráfica
  const chartData = scenarioData.map((item) => ({
    month: monthNames[item.month - 1] || `Mes ${item.month}`, // Usar nombre del mes
    revenue: Number(item.revenue.toFixed(2)),
    costs: Number(item.costs.toFixed(2)),
    profit: Number(item.profit.toFixed(2))
  }));

  // Formateo de moneda
  const formatCurrency = (value: number) => {
    return `${baseScenario.currency || "MXN"} $${Math.round(value).toLocaleString("es-MX")}`;
  };

  return (
    <Container
      fluid
      style={{
        padding: "1.5em",
        background: "linear-gradient(135deg, #f0f4f8 0%, #e0e8f0 100%)" // Gradiente suave
      }}
    >
      <h2 style={{ marginBottom: "1em", color: "#2c3e50", fontWeight: "bold" }}>
        <FaBusAlt style={{ marginRight: 10, color: "#2980b9" }} />
        Proyecciones y Escenarios Financieros
      </h2>

      <Row>
        {/* Columna Izquierda: Noticias y Parámetros */}
        <Col lg={4} style={{ marginBottom: "1em" }}>
          {/* Sección: Noticias y Consejos */}
          <Card className="shadow-sm" style={{ border: "1px solid #bdc3c7", marginBottom: "1em" }}>
            <Card.Header
              onClick={() => setShowNews(!showNews)}
              style={{
                cursor: "pointer",
                backgroundColor: "#ecf0f1", // Gris claro
                color: "#34495e",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: "600"
              }}
            >
              <span>
                <FaInfoCircle style={{ marginRight: 8, color: "#3498db" }} />
                Noticias y Consejos del Sector
              </span>
              {showNews ? <FaAngleUp /> : <FaAngleDown />}
            </Card.Header>
            <Collapse in={showNews}>
              <Card.Body style={{ background: "#ffffff" }}>
                {newsAndTips.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      marginBottom: "1em",
                      paddingBottom: "0.5em",
                      borderBottom: idx !== newsAndTips.length - 1 ? "1px dashed #dfe6e9" : "none"
                    }}
                  >
                    <h6 style={{ color: "#2c3e50", fontWeight: "bold", display: "flex", alignItems: "center" }}>
                      {item.icon} {item.title}
                    </h6>
                    <p style={{ color: "#555", marginBottom: "0.25em", fontSize: "0.9em" }}>{item.detail}</p>
                    <p style={{ color: "#2980b9", marginBottom: 0, fontSize: "0.9em", fontStyle: "italic" }}>
                      <FaLightbulb style={{ marginRight: 5 }}/>Consejo: {item.advice}
                    </p>
                  </div>
                ))}
              </Card.Body>
            </Collapse>
          </Card>

          {/* Sección: Parámetros */}
          <Card className="shadow-sm" style={{ border: "1px solid #bdc3c7" }}>
            <Card.Header
              onClick={() => setShowParameters(!showParameters)}
              style={{
                cursor: "pointer",
                backgroundColor: "#ecf0f1",
                color: "#34495e",
                fontWeight: "600",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>Ajuste de Parámetros del Negocio</span>
              {showParameters ? <FaAngleUp /> : <FaAngleDown />}
            </Card.Header>
            <Collapse in={showParameters}>
              <Card.Body style={{ maxHeight: '400px', overflowY: 'auto' }}>
                {/* Formulario de Parámetros */}
                <Form.Group className="mb-2">
                  <Form.Label>Ingresos Base Mensuales</Form.Label>
                  <Form.Control type="number" value={Math.round(baseScenario.baseRevenue)} onChange={(e) => setBaseScenario({ ...baseScenario, baseRevenue: Number(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Costos Fijos Mensuales</Form.Label>
                  <Form.Control type="number" value={Math.round(baseScenario.baseCosts)} onChange={(e) => setBaseScenario({ ...baseScenario, baseCosts: Number(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Pago a Guías (Total Mes)</Form.Label>
                  <Form.Control type="number" value={Math.round(baseScenario.guideCosts)} onChange={(e) => setBaseScenario({ ...baseScenario, guideCosts: Number(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Mantenimiento de Vehículos (Mes)</Form.Label>
                  <Form.Control type="number" value={Math.round(baseScenario.fleetMaintenance)} onChange={(e) => setBaseScenario({ ...baseScenario, fleetMaintenance: Number(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Presupuesto de Marketing (Mes)</Form.Label>
                  <Form.Control type="number" value={Math.round(baseScenario.marketingBudget)} onChange={(e) => setBaseScenario({ ...baseScenario, marketingBudget: Number(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Impacto de Competencia (%)</Form.Label>
                  <Form.Control type="number" value={baseScenario.competitorEffect} onChange={(e) => setBaseScenario({ ...baseScenario, competitorEffect: Number(e.target.value) })} />
                </Form.Group>
                <Form.Check className="mb-3" type="checkbox" label="Plan de Expansión Activo" checked={baseScenario.expansionPlanActive} onChange={(e) => setBaseScenario({ ...baseScenario, expansionPlanActive: e.target.checked })} />
                <Form.Group className="mb-2">
                  <Form.Label>Crecimiento Histórico Anual (%)</Form.Label>
                  <Form.Control type="number" value={baseScenario.historicGrowthRate} onChange={(e) => setBaseScenario({ ...baseScenario, historicGrowthRate: Number(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Índice de Afluencia Turística (%)</Form.Label>
                  <Form.Control type="number" value={baseScenario.touristInfluxIndex} onChange={(e) => setBaseScenario({ ...baseScenario, touristInfluxIndex: Number(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Impacto de Eventos Locales (%)</Form.Label>
                  <Form.Control type="number" value={baseScenario.localEventsWeight} onChange={(e) => setBaseScenario({ ...baseScenario, localEventsWeight: Number(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Tasa de Inflación Anual (%)</Form.Label>
                  <Form.Control type="number" value={baseScenario.inflationRate} onChange={(e) => setBaseScenario({ ...baseScenario, inflationRate: Number(e.target.value) })} disabled={baseScenario.ignoreInflation} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Tasa de Impuestos (%)</Form.Label>
                  <Form.Control type="number" value={baseScenario.taxRate} onChange={(e) => setBaseScenario({ ...baseScenario, taxRate: Number(e.target.value) })} />
                </Form.Group>
                <Form.Check className="mb-2" type="checkbox" label="Considerar Crisis Externa" checked={baseScenario.crisisActive} onChange={(e) => setBaseScenario({ ...baseScenario, crisisActive: e.target.checked })} disabled={baseScenario.ignoreCrisis} />
                <Row className="mb-2">
                  <Col><Form.Check type="checkbox" label="Ignorar Inflación" checked={baseScenario.ignoreInflation} onChange={(e) => setBaseScenario({ ...baseScenario, ignoreInflation: e.target.checked })} /></Col>
                  <Col><Form.Check type="checkbox" label="Ignorar Crisis" checked={baseScenario.ignoreCrisis} onChange={(e) => setBaseScenario({ ...baseScenario, ignoreCrisis: e.target.checked })} /></Col>
                </Row>
                <Form.Group className="mb-2">
                  <Form.Label>Ajuste de Precios de Tours (%)</Form.Label>
                  <Form.Control type="number" value={baseScenario.priceAdjustment} onChange={(e) => setBaseScenario({ ...baseScenario, priceAdjustment: Number(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Variación por Estacionalidad (%)</Form.Label>
                  <Form.Control type="number" value={baseScenario.seasonalVariation} onChange={(e) => setBaseScenario({ ...baseScenario, seasonalVariation: Number(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Tasa de Descuento Promedio (%)</Form.Label>
                  <Form.Control type="number" value={baseScenario.discountRate} onChange={(e) => setBaseScenario({ ...baseScenario, discountRate: Number(e.target.value) })} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Meses a Proyectar</Form.Label>
                  <Form.Control type="number" value={projectionMonths} onChange={(e) => setProjectionMonths(Number(e.target.value))} />
                </Form.Group>
                <Form.Group className="mb-2">
                  <Form.Label>Moneda (ej. MXN, USD)</Form.Label>
                  <Form.Control type="text" value={baseScenario.currency} onChange={(e) => setBaseScenario({ ...baseScenario, currency: e.target.value })} />
                </Form.Group>
                <Button variant="outline-primary" style={{ marginTop: 10, width: "100%" }}>
                  Actualizar Proyección
                </Button>
              </Card.Body>
            </Collapse>
          </Card>
        </Col>

        {/* Columna Derecha: Resultados y Gráfica */}
        <Col lg={8}>
          {/* Sección: Resultados Principales */}
          <Card className="shadow-sm" style={{ border: "1px solid #bdc3c7", marginBottom: "1em" }}>
            <Card.Header style={{ backgroundColor: "#dde6eb", color: "#2c3e50", fontWeight: "600" }}>
              <FaChartLine style={{ marginRight: 8 }}/>Resultados Clave de la Proyección
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6} style={{ marginBottom: "1em" }}>
                  <p style={{ margin: "0.2em 0" }}><strong>Ingresos Totales Estimados:</strong> <span style={{ color: "#2980b9" }}>{formatCurrency(totalRevenue)}</span></p>
                  <p style={{ margin: "0.2em 0" }}><strong>Costos Totales Estimados:</strong> <span style={{ color: "#c0392b" }}>{formatCurrency(totalCosts)}</span></p>
                </Col>
                <Col md={6} style={{ marginBottom: "1em" }}>
                  <p style={{ margin: "0.2em 0" }}><strong>Impuestos Totales Estimados:</strong> <span style={{ color: "#f39c12" }}>{formatCurrency(totalTaxes)}</span></p>
                  <p style={{ margin: "0.2em 0" }}><strong>Utilidad Neta Estimada:</strong>
                    <span style={{ color: totalProfit < 0 ? "#c0392b" : "#27ae60", fontWeight: "bold" }}> {formatCurrency(totalProfit)}</span>
                  </p>
                </Col>
              </Row>
              <hr style={{ margin: "0.5em 0" }}/>
              <p style={{ margin: "0.5em 0" }}>
                <strong>Margen de Utilidad Neto:</strong>
                <strong style={{ color: totalProfit < 0 ? "#c0392b" : "#27ae60", marginLeft: "5px" }}>
                  {totalRevenue !== 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : "0.00"}%
                </strong>
              </p>
              <ProgressBar style={{ height: "20px" }}>
                <ProgressBar striped variant="success" now={totalRevenue !== 0 ? (totalProfit > 0 ? (totalProfit / totalRevenue) * 100 : 0) : 0} key={1} label={totalProfit > 0 ? `${((totalProfit / totalRevenue) * 100).toFixed(1)}% Utilidad` : ''}/>
                <ProgressBar variant="danger" now={totalRevenue !== 0 ? (totalCosts / totalRevenue) * 100 : 0} key={2} label={`${((totalCosts / totalRevenue) * 100).toFixed(1)}% Costos`}/>
                <ProgressBar variant="warning" now={totalRevenue !== 0 ? (totalTaxes / totalRevenue) * 100 : 0} key={3} label={`${((totalTaxes / totalRevenue) * 100).toFixed(1)}% Impuestos`}/>
              </ProgressBar>
              <Card.Text style={{ marginTop: "1em", fontSize: "0.9em", color: "#7f8c8d" }}>
                <strong>Interpretación:</strong> Los <strong>ingresos</strong> son todo el dinero que entra. Los <strong>costos</strong> son tus gastos para operar. Los <strong>impuestos</strong> son lo que pagas al gobierno. La <strong>utilidad neta</strong> es tu ganancia real después de todo. Un margen de utilidad positivo significa que tu negocio es rentable.
              </Card.Text>
            </Card.Body>
          </Card>

          {/* Sección: Gráfica de Proyección */}
          <Card className="shadow-sm" style={{ border: "1px solid #bdc3c7", marginBottom: "1em" }}>
            <Card.Header style={{ backgroundColor: "#dde6eb", color: "#2c3e50", fontWeight: "600" }}>
              Gráfica de Proyección Mensual
            </Card.Header>
            <Card.Body style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cccccc" />
                  <XAxis dataKey="month" stroke="#555" />
                  <YAxis stroke="#555" tickFormatter={(value) => `$${(Number(value)/1000).toFixed(0)}k`} />
                  <RechartsTooltip formatter={(value) => [formatCurrency(Number(value)), "Monto"]} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} name="Ingresos" dot={{ r: 3 }} activeDot={{ r: 5 }}/>
                  <Line type="monotone" dataKey="costs" stroke="#dc2626" strokeWidth={2} name="Costos" dot={{ r: 3 }} activeDot={{ r: 5 }}/>
                  <Line type="monotone" dataKey="profit" stroke="#16a34a" strokeWidth={2} name="Utilidad" dot={{ r: 3 }} activeDot={{ r: 5 }}/>
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>

          {/* Sección: Detalle Mensual */}
          <Card className="shadow-sm" style={{ border: "1px solid #bdc3c7" }}>
            <Card.Header
              onClick={() => setShowDetails(!showDetails)}
              style={{
                cursor: "pointer",
                backgroundColor: "#ecf0f1",
                color: "#34495e",
                fontWeight: "600",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span>Detalle Mes a Mes de la Proyección</span>
              {showDetails ? <FaAngleUp /> : <FaAngleDown />}
            </Card.Header>
            <Collapse in={showDetails}>
              <Card.Body style={{ maxHeight: 300, overflowY: "auto" }}>
                <Table striped bordered hover size="sm">
                  <thead style={{ backgroundColor: "#f8f9fa", color: "#495057" }}>
                    <tr>
                      <th>Mes</th>
                      <th>Ingresos</th>
                      <th>Costos</th>
                      <th>Impuestos</th>
                      <th>Utilidad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarioData.map((r, idx) => (
                      <tr key={idx}>
                        <td>{monthNames[r.month - 1] || r.month}</td>
                        <td style={{ color: "#2563eb" }}>{formatCurrency(addNoise(r.revenue))}</td>
                        <td style={{ color: "#dc2626" }}>{formatCurrency(addNoise(r.costs))}</td>
                        <td style={{ color: "#f59e0b" }}>{formatCurrency(addNoise(r.taxes))}</td>
                        <td style={{ color: r.profit < 0 ? "#c0392b" : "#16a34a", fontWeight: "bold" }}>
                          {formatCurrency(addNoise(r.profit))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Collapse>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default FinancialProjectionDashboardToursFinal;