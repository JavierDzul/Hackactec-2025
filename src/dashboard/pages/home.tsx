import React, { useState }  from 'react';
import { Container, Row, Col, Card, Badge, Alert, Table, ProgressBar, Button, ListGroup } from 'react-bootstrap';
import { 
  FaHome, FaChartPie, FaChartBar, FaChartLine, FaFire, FaMapMarkedAlt, FaExclamationTriangle, 
  FaDollarSign, FaBalanceScale, FaPercentage, FaCalendarAlt, FaArrowUp, FaArrowDown, FaFilter 
} from 'react-icons/fa';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  LineChart, // Added LineChart import
  BarChart,   // Added BarChart import
} from 'recharts';

// Constantes actualizadas
const CURRENT_USER_LOGIN = "rafaello129";
const CURRENT_DATE_UTC = "2025-05-22 07:47:18"; // Updated to match user provided time

// Tipos y Datos Simulados
type RiesgoNivel = 'verde' | 'amarillo' | 'rojo';
const riesgoActual: RiesgoNivel = 'amarillo'; // Ejemplo: Riesgo Medio

interface KpiData {
  ingresosMesActual: number;
  ingresosMesAnterior: number;
  utilidadMesActual: number;
  utilidadMesAnterior: number;
  ratioLiquidez: number;
  nivelEndeudamiento: number;
  crecimientoIngresos: number;  // Added to interface
  crecimientoUtilidad: number; // Added to interface
}

const ingresosGastosData = [
  { name: 'Dic \'24', ingresos: 7200, gastos: 4500, utilidad: 2700 },
  { name: 'Ene \'25', ingresos: 7800, gastos: 4800, utilidad: 3000 },
  { name: 'Feb \'25', ingresos: 7500, gastos: 4600, utilidad: 2900 },
  { name: 'Mar \'25', ingresos: 8200, gastos: 5000, utilidad: 3200 },
  { name: 'Abr \'25', ingresos: 8500, gastos: 5200, utilidad: 3300 },
  { name: 'May \'25', ingresos: 8000, gastos: 4900, utilidad: 3100 },
];

const margenUtilidadData = [
  { name: 'Dic \'24', margen: parseFloat(((7200 - 4500) / 7200 * 100).toFixed(1)) },
  { name: 'Ene \'25', margen: parseFloat(((7800 - 4800) / 7800 * 100).toFixed(1)) },
  { name: 'Feb \'25', margen: parseFloat(((7500 - 4600) / 7500 * 100).toFixed(1)) },
  { name: 'Mar \'25', margen: parseFloat(((8200 - 5000) / 8200 * 100).toFixed(1)) },
  { name: 'Abr \'25', margen: parseFloat(((8500 - 5200) / 8500 * 100).toFixed(1)) },
  { name: 'May \'25', margen: parseFloat(((8000 - 4900) / 8000 * 100).toFixed(1)) },
];

const tendenciasAnualesData = [
  { year: '2022', Ingresos: 85000, 'Utilidad Neta': 20000, 'Gastos Totales': 65000 },
  { year: '2023', Ingresos: 95000, 'Utilidad Neta': 25000, 'Gastos Totales': 70000 },
  { year: '2024', Ingresos: 105000, 'Utilidad Neta': 28000, 'Gastos Totales': 77000 },
];

const distribucionGastosData = [
    { name: 'Operativos', value: 45000, color: '#0088FE' },
    { name: 'Marketing', value: 15000, color: '#00C49F' },
    { name: 'Administrativos', value: 10000, color: '#FFBB28' },
    { name: 'Otros', value: 7000, color: '#FF8042' },
];

const heatmapDataConceptual = [
    { periodo: "Temporada Baja (Ene-Mar)", productoA: "Medio", productoB: "Bajo", servicioC: "Alto" },
    { periodo: "Temporada Media (Abr-Jun)", productoA: "Alto", productoB: "Medio", servicioC: "Medio" },
    { periodo: "Temporada Alta (Jul-Sep)", productoA: "Muy Alto", productoB: "Alto", servicioC: "Bajo" },
    { periodo: "Temporada Media (Oct-Dic)", productoA: "Alto", productoB: "Medio", servicioC: "Medio" },
    { periodo: "Eventos Especiales", productoA: "Pico", productoB: "Pico", servicioC: "Variable" },
];

const kpiDataBase = {
  ingresosMesActual: 8000,
  ingresosMesAnterior: 8500,
  utilidadMesActual: 3100,
  utilidadMesAnterior: 3300,
  ratioLiquidez: 1.8, 
  nivelEndeudamiento: 0.45,
};

const kpiData: KpiData = {
    ...kpiDataBase,
    crecimientoIngresos: ((kpiDataBase.ingresosMesActual - kpiDataBase.ingresosMesAnterior) / kpiDataBase.ingresosMesAnterior) * 100,
    crecimientoUtilidad: ((kpiDataBase.utilidadMesActual - kpiDataBase.utilidadMesAnterior) / kpiDataBase.utilidadMesAnterior) * 100,
};


const PanelHomeMipymesPlus: React.FC = () => {
  const getRiesgoBadgeVariant = (nivel: RiesgoNivel) => {
    if (nivel === 'verde') return 'success';
    if (nivel === 'amarillo') return 'warning';
    return 'danger';
  };

  const getRiesgoText = (nivel: RiesgoNivel) => {
    if (nivel === 'verde') return 'Bajo Control';
    if (nivel === 'amarillo') return 'Precaución';
    return 'Crítico';
  };
  
  const formatCurrency = (value: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const renderCustomizedLabelPie = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="10px" fontWeight="bold">
        {`${name} (${(percent * 100).toFixed(0)}%)`}
      </text>
    );
  };

  return (
    <Container fluid className="pt-3 pb-5">
      <Row className="mb-3">
        <Col>
          <Card className="shadow-sm">
            <Card.Header as="h4" className="header-main d-flex align-items-center justify-content-between">
              <div><FaHome className="me-2" /> Panel Estratégico MIPYME</div>
              <div className="text-end">
                <small className="d-block text-muted" style={{fontSize: '0.75rem'}}>Usuario: {CURRENT_USER_LOGIN}</small>
                <small className="d-block text-muted" style={{fontSize: '0.75rem'}}>Actualizado: {CURRENT_DATE_UTC}</small>
              </div>
            </Card.Header>
            <Card.Body>
                <Row className="mb-3 g-3">
                    <Col md={3} sm={6}>
                        <Card className="text-center kpi-card">
                            <Card.Body>
                                <FaDollarSign size="2em" className="text-success mb-2"/>
                                <Card.Title as="h6" className="text-muted">Ingresos (Este Mes)</Card.Title>
                                <Card.Text className="fs-5 fw-bold">{formatCurrency(kpiData.ingresosMesActual)}</Card.Text>
                                <small className={`d-block ${kpiData.crecimientoIngresos >= 0 ? 'text-success' : 'text-danger'}`}>
                                    {kpiData.crecimientoIngresos >= 0 ? <FaArrowUp/> : <FaArrowDown/>} {formatPercentage(Math.abs(kpiData.crecimientoIngresos))} vs mes anterior
                                </small>
                            </Card.Body>
                        </Card>
                    </Col>
                     <Col md={3} sm={6}>
                        <Card className="text-center kpi-card">
                            <Card.Body>
                                <FaBalanceScale size="2em" className="text-primary mb-2"/>
                                <Card.Title as="h6" className="text-muted">Utilidad Neta (Este Mes)</Card.Title>
                                <Card.Text className="fs-5 fw-bold">{formatCurrency(kpiData.utilidadMesActual)}</Card.Text>
                                <small className={`d-block ${kpiData.crecimientoUtilidad >= 0 ? 'text-success' : 'text-danger'}`}>
                                     {kpiData.crecimientoUtilidad >= 0 ? <FaArrowUp/> : <FaArrowDown/>} {formatPercentage(Math.abs(kpiData.crecimientoUtilidad))} vs mes anterior
                                </small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="text-center kpi-card">
                            <Card.Body>
                                <FaPercentage size="2em" className="text-info mb-2"/>
                                <Card.Title as="h6" className="text-muted">Ratio Liquidez</Card.Title>
                                <Card.Text className={`fs-5 fw-bold ${kpiData.ratioLiquidez >= 1.5 ? 'text-success' : 'text-warning'}`}>{kpiData.ratioLiquidez.toFixed(2)}</Card.Text>
                                <small className="d-block text-muted">(Ideal: &gt;1.5)</small>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={3} sm={6}>
                        <Card className="text-center kpi-card">
                            <Card.Body>
                                <FaChartLine size="2em" className="text-warning mb-2"/>
                                <Card.Title as="h6" className="text-muted">Nivel Endeudamiento</Card.Title>
                                <Card.Text className={`fs-5 fw-bold ${kpiData.nivelEndeudamiento < 0.6 ? 'text-success' : 'text-warning'}`}>{(kpiData.nivelEndeudamiento * 100).toFixed(0)}%</Card.Text>
                                <small className="d-block text-muted">(Ideal: &lt;60%)</small>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
             </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* Columna Izquierda: Gráficos Principales y Semáforo */}
        <Col lg={8} className="mb-3">
          <Card className="shadow-sm mb-3">
            <Card.Header as="h5" className="bg-light text-primary d-flex align-items-center">
              <FaChartPie className="me-2" /> Desempeño Financiero Mensual (Últimos 6 Meses)
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={ingresosGastosData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                  <XAxis dataKey="name" tick={{fontSize: 12}}/>
                  <YAxis yAxisId="left" orientation="left" stroke="#8884d8" tickFormatter={formatCurrency} tick={{fontSize: 10}}/>
                  <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tickFormatter={formatCurrency} tick={{fontSize: 10}}/>
                  <Tooltip formatter={(value: number, name: string) => [formatCurrency(value), name.charAt(0).toUpperCase() + name.slice(1)]}/>
                  <Legend wrapperStyle={{fontSize: "12px"}}/>
                  <Bar yAxisId="left" dataKey="ingresos" barSize={20} fill="#8884d8" name="Ingresos"/>
                  <Line yAxisId="right" type="monotone" dataKey="gastos" stroke="#ff7300" name="Gastos" strokeWidth={2}/>
                  <Line yAxisId="right" type="monotone" dataKey="utilidad" stroke="#82ca9d" name="Utilidad" strokeWidth={2}/>
                </ComposedChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
          
          <Row>
             <Col md={6} className="mb-3">
                 <Card className="shadow-sm h-100">
                    <Card.Header as="h6" className="bg-light text-primary d-flex align-items-center">
                      <FaPercentage className="me-2" /> Margen de Utilidad Bruta (%)
                    </Card.Header>
                    <Card.Body>
                       <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={margenUtilidadData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                          <XAxis dataKey="name" tick={{fontSize: 10}}/>
                          <YAxis tickFormatter={(value) => `${value}%`} tick={{fontSize: 10}}/>
                          <Tooltip formatter={(value: number) => [`${value}%`, "Margen"]}/>
                          <Line type="monotone" dataKey="margen" stroke="#3498db" strokeWidth={2} dot={{r:4}} activeDot={{r:6}}/>
                        </LineChart>
                      </ResponsiveContainer>
                    </Card.Body>
                </Card>
             </Col>
             <Col md={6} className="mb-3">
                <Card className="shadow-sm h-100">
                    <Card.Header as="h6" className="bg-light text-primary d-flex align-items-center">
                      <FaChartBar className="me-2" /> Tendencias Anuales Clave
                    </Card.Header>
                    <Card.Body>
                       <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={tendenciasAnualesData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0"/>
                          <XAxis dataKey="year" tick={{fontSize: 10}}/>
                          <YAxis tickFormatter={formatCurrency} tick={{fontSize: 10}}/>
                          <Tooltip formatter={(value:number) => formatCurrency(value)}/>
                          <Legend wrapperStyle={{fontSize: "10px"}}/>
                          <Bar dataKey="Ingresos" fill="#2ecc71" barSize={15}/>
                          <Bar dataKey="Utilidad Neta" fill="#f1c40f" barSize={15}/>
                        </BarChart>
                      </ResponsiveContainer>
                    </Card.Body>
                </Card>
             </Col>
          </Row>
        </Col>

        {/* Columna Derecha: Semáforo, Distribución de Gastos y Mapa de Calor */}
        <Col lg={4} className="mb-3">
          <Card className="shadow-sm mb-3">
            <Card.Header as="h5" className="bg-light text-danger d-flex align-items-center">
              <FaExclamationTriangle className="me-2" /> Semáforo de Riesgo General
            </Card.Header>
            <Card.Body className="text-center">
              <div className="d-flex justify-content-center align-items-center my-3">
                <div className={`traffic-light-circle ${riesgoActual === 'rojo' ? 'active red' : 'dimmed'}`}></div>
                <div className={`traffic-light-circle ${riesgoActual === 'amarillo' ? 'active yellow' : 'dimmed'}`}></div>
                <div className={`traffic-light-circle ${riesgoActual === 'verde' ? 'active green' : 'dimmed'}`}></div>
              </div>
              <Badge pill bg={getRiesgoBadgeVariant(riesgoActual)} className="fs-6 px-3 py-2 shadow-sm mb-2">
                Nivel: {getRiesgoText(riesgoActual)}
              </Badge>
              <ListGroup variant="flush" className="text-start small mt-3">
                <ListGroup.Item className="px-1 py-1"><FaDollarSign className="me-1 text-success"/><strong>Liquidez:</strong> Capacidad de cubrir obligaciones a corto plazo. (Ratio Actual: {kpiData.ratioLiquidez.toFixed(2)})</ListGroup.Item>
                <ListGroup.Item className="px-1 py-1"><FaBalanceScale className="me-1 text-warning"/><strong>Deuda:</strong> Nivel de endeudamiento y capacidad de servicio. (Deuda/Patrimonio Actual: {kpiData.nivelEndeudamiento.toFixed(2)})</ListGroup.Item>
                <ListGroup.Item className="px-1 py-1"><FaChartLine className="me-1 text-info"/><strong>Proyecciones:</strong> Estimaciones de rentabilidad y crecimiento futuro.</ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Card className="shadow-sm mb-3">
            <Card.Header as="h6" className="bg-light text-primary d-flex align-items-center">
              <FaChartPie className="me-2" /> Distribución de Gastos (Anual Estimado)
            </Card.Header>
            <Card.Body>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={distribucionGastosData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabelPie}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {distribucionGastosData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value:number) => formatCurrency(value)}/>
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header as="h6" className="bg-light text-primary d-flex align-items-center">
              <FaFire className="me-2" /> Impacto de Temporadas (Conceptual)
            </Card.Header>
            <Card.Body className="p-0">
                <Table striped hover responsive size="sm" className="small mb-0">
                    <thead className="table-light">
                        <tr>
                            <th>Periodo/Evento</th>
                            <th>Producto A</th>
                            <th>Producto B</th>
                            <th>Servicio C</th>
                        </tr>
                    </thead>
                    <tbody>
                        {heatmapDataConceptual.map(item => (
                            <tr key={item.periodo}>
                                <td className="fw-bold">{item.periodo}</td>
                                <td><Badge bg={item.productoA === "Pico" || item.productoA === "Muy Alto" ? "danger" : item.productoA === "Alto" ? "warning" : "success"} pill className="w-100">{item.productoA}</Badge></td>
                                <td><Badge bg={item.productoB === "Pico" || item.productoB === "Muy Alto" ? "danger" : item.productoB === "Alto" ? "warning" : "success"} pill className="w-100">{item.productoB}</Badge></td>
                                <td><Badge bg={item.servicioC === "Pico" || item.servicioC === "Muy Alto" ? "danger" : item.servicioC === "Alto" ? "warning" : "success"} pill className="w-100">{item.servicioC}</Badge></td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
                 <small className="d-block text-muted p-2 fst-italic">Nota: Esta tabla representa un análisis conceptual del impacto de temporadas. Una visualización de mapa de calor interactiva sería implementada en una versión completa.</small>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style type="text/css">{`
        body { background-color: #f4f6f9; font-family: 'Segoe UI', sans-serif; }
        .card { border: none !important; border-radius: .5rem; }
        .card-header { border-bottom: 1px solid #e9ecef; font-weight: 500;}
        .header-main { background-color: #fff; color: #007bff; }
        .kpi-card { transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; }
        .kpi-card:hover { transform: translateY(-3px); box-shadow: 0 .5rem 1rem rgba(0,0,0,.1) !important; }
        .traffic-light-circle { width: 40px; height: 40px; border-radius: 50%; margin: 0 6px; border: 2px solid #d0d0d0; transition: all 0.3s ease; }
        .traffic-light-circle.dimmed { background-color: #e9ecef; opacity: 0.5; }
        .traffic-light-circle.active.red { background-color: #dc3545; box-shadow: 0 0 10px 2px rgba(220, 53, 69, 0.6); }
        .traffic-light-circle.active.yellow { background-color: #ffc107; box-shadow: 0 0 10px 2px rgba(255, 193, 7, 0.6); }
        .traffic-light-circle.active.green { background-color: #198754; box-shadow: 0 0 10px 2px rgba(25, 135, 84, 0.6); }
        .recharts-default-tooltip { border-radius: .25rem !important; box-shadow: 0 .25rem .75rem rgba(0,0,0,.1) !important; font-size: 12px !important; }
        .table badge { font-weight: 500; font-size: 0.75rem;}
      `}</style>
    </Container>
  );
};

export default PanelHomeMipymesPlus;