import { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, ProgressBar, Form } from 'react-bootstrap';
import { BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const ContabilidadDashboard = () => {
  // Datos simulados
  const [cashFlow] = useState([
    { month: 'Ene', ingresos: 145300, gastos: 98300 },
    { month: 'Feb', ingresos: 162450, gastos: 112400 },
    { month: 'Mar', ingresos: 158900, gastos: 105600 },
    { month: 'Abr', ingresos: 174200, gastos: 98700 },
    { month: 'May', ingresos: 189500, gastos: 132000 },
  ]);

  const [accounts] = useState([
    { name: 'Caja Chica', balance: 25000, type: 'efectivo' },
    { name: 'Banco Principal', balance: 1450000, type: 'cuenta' },
    { name: 'Inversiones', balance: 750000, type: 'inversion' },
  ]);

  const [transactions] = useState([
    { date: '2024-05-15', description: 'Pago cliente XYZ', amount: 45000, type: 'ingreso' },
    { date: '2024-05-14', description: 'Servicios cloud', amount: 1200, type: 'gasto' },
    { date: '2024-05-13', description: 'Equipo oficina', amount: 8500, type: 'gasto' },
    { date: '2024-05-12', description: 'Venta producto A', amount: 23700, type: 'ingreso' },
  ]);

  const [budgets] = useState([
    { category: 'Marketing', budget: 50000, actual: 48700 },
    { category: 'TI', budget: 30000, actual: 31200 },
    { category: 'RRHH', budget: 45000, actual: 42900 },
    { category: 'Operaciones', budget: 75000, actual: 69800 },
  ]);

  // Configuración de estilo
  const themeColors = {
    ingresos: '#2ecc71',
    gastos: '#e74c3c',
    efectivo: '#3498db',
    inversion: '#9b59b6',
    meta: '#f1c40f'
  };

  return (
    <Container fluid className="p-4 bg-light">
      {/* Fila Superior: Resumen Rápido */}
      <Row className="g-4 mb-4">
        <Col xl={3} lg={6}>
          <Card className="shadow border-0 h-100">
            <Card.Body>
              <div className="d-flex align-items-center">
                <div className="bg-primary rounded-circle p-3 me-3">
                  <i className="bi bi-cash-coin text-white fs-4"></i>
                </div>
                <div>
                  <small className="text-muted">Liquidez Total</small>
                  <h3 className="mb-0">$1,725,000</h3>
                </div>
              </div>
              <hr />
              <div className="d-flex justify-content-between">
                <div>
                  <small className="text-muted">Disponible</small>
                  <div className="fs-5">$1,235,000</div>
                </div>
                <div>
                  <small className="text-muted">Invertido</small>
                  <div className="fs-5">$490,000</div>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6}>
          <Card className="shadow border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">ROI Trimestral</small>
                  <h3 className="text-success mb-0">8.4%</h3>
                </div>
                <div className="bg-success rounded-circle p-3">
                  <i className="bi bi-graph-up text-white fs-4"></i>
                </div>
              </div>
              <hr />
              <ProgressBar now={84} variant="success" className="mb-2" />
              <small className="text-muted">Meta anual: 15%</small>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="shadow border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <Card.Title>Flujo de Caja</Card.Title>
                  <small className="text-muted">Últimos 12 meses</small>
                </div>
                <Button variant="outline-primary" size="sm">
                  <i className="bi bi-download me-2"></i>Reporte
                </Button>
              </div>
              <div style={{ height: '120px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cashFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="ingresos" 
                      stroke={themeColors.ingresos} 
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="gastos" 
                      stroke={themeColors.gastos} 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sección Principal */}
      <Row className="g-4">
        {/* Columna Izquierda */}
        <Col xl={8}>
          <Card className="shadow border-0 h-100">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <Card.Title>Análisis Financiero</Card.Title>
                <Form.Select size="sm" style={{ width: '200px' }}>
                  <option>Este mes</option>
                  <option>Últimos 6 meses</option>
                  <option>12 meses</option>
                </Form.Select>
              </div>
              
              <div style={{ height: '400px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cashFlow}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="ingresos" 
                      fill={themeColors.ingresos}
                      name="Ingresos"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar 
                      dataKey="gastos" 
                      fill={themeColors.gastos}
                      name="Gastos"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Columna Derecha */}
        <Col xl={4}>
          <Card className="shadow border-0 h-100">
            <Card.Body>
              <Card.Title className="mb-4">Distribución de Fondos</Card.Title>
              <div style={{ height: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={accounts}
                      dataKey="balance"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      innerRadius={60}
                    >
                      {accounts.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`}
                          fill={
                            entry.type === 'efectivo' ? themeColors.efectivo :
                            entry.type === 'inversion' ? themeColors.inversion :
                            themeColors.meta
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend layout="vertical" align="right" verticalAlign="middle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Fila Inferior */}
      <Row className="g-4 mt-4">
        <Col xl={6}>
          <Card className="shadow border-0">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title>Últimas Transacciones</Card.Title>
              </div>
              <Table hover>
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Descripción</th>
                    <th className="text-end">Monto</th>
                    <th>Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => (
                    <tr key={i}>
                      <td>{t.date}</td>
                      <td>{t.description}</td>
                      <td className={`text-end ${t.type === 'ingreso' ? 'text-success' : 'text-danger'}`}>
                        ${t.amount.toLocaleString()}
                      </td>
                      <td>
                        <span className={`badge bg-${t.type === 'ingreso' ? 'success' : 'danger'}`}>
                          {t.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={6}>
          <Card className="shadow border-0">
            <Card.Body>
              <Card.Title className="mb-4">Presupuesto vs Real</Card.Title>
              {budgets.map((b, i) => (
                <div key={i} className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <div>{b.category}</div>
                    <div>
                      <span className="text-success">${b.actual.toLocaleString()}</span>
                      <span className="text-muted mx-2">/</span>
                      <span className="text-primary">${b.budget.toLocaleString()}</span>
                    </div>
                  </div>
                  <ProgressBar now={(b.actual / b.budget) * 100} 
                    variant={(b.actual / b.budget) > 1 ? 'danger' : 'success'}
                    style={{ height: '8px' }}
                  />
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ContabilidadDashboard;