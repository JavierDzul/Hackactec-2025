import React, { useState, useEffect, useMemo } from 'react';
import { Container, Row, Col, Card, Form, Button, ProgressBar, Alert, Table, InputGroup, Badge, Modal, ListGroup } from 'react-bootstrap';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FaBalanceScale, FaRecycle, FaDollarSign, FaUsers, FaTools, FaBullhorn, FaExclamationTriangle, FaChartPie, FaSlidersH, FaCheckCircle, FaTimesCircle, FaPiggyBank, FaIndustry, FaShoppingCart, FaCog, FaLightbulb, FaChartLine } from 'react-icons/fa'; // FaLightbulb y FaChartLine añadidas aquí

// Interfaces (se mantienen similares, el contenido cambiará)
interface PresupuestoCategoria {
  id: string;
  nombre: string;
  asignado: number;
  porcentaje?: number;
  color: string;
  icono: React.ElementType;
  descripcion?: string;
}

interface PrioridadOptimizacion {
  id: 'aumentarVentas' | 'reducirGastos' | 'mejorarEficiencia' | 'crearReserva';
  nombre: string;
  descripcion: string;
  activa: boolean;
  impactoEstimado?: string;
}

interface SugerenciaRedistribucion {
  categoriaId: string;
  cambio: number;
  justificacion: string;
}

// Ajustado para MIPYMES
const TOTAL_PRESUPUESTO_INICIAL_MIPYME = 150000; 

const COLORES_GRAFICAS_MIPYME = ['#28A745', '#17A2B8', '#FFC107', '#DC3545', '#6F42C1'];

const categoriasPresupuestoBaseMIPYME: Omit<PresupuestoCategoria, 'asignado' | 'porcentaje'>[] = [
  { id: 'ventasMarketing', nombre: 'Ventas y Marketing', color: COLORES_GRAFICAS_MIPYME[0], icono: FaShoppingCart, descripcion: 'Promoción, publicidad, comisiones, material de ventas.' },
  { id: 'operacionesProduccion', nombre: 'Operaciones / Producción', color: COLORES_GRAFICAS_MIPYME[1], icono: FaIndustry, descripcion: 'Costos directos de producción o prestación de servicios, insumos.' },
  { id: 'gastosAdministrativos', nombre: 'Administración y Gastos Fijos', color: COLORES_GRAFICAS_MIPYME[2], icono: FaCog, descripcion: 'Renta, servicios básicos, sueldos administrativos, contabilidad.' },
  { id: 'inversionCrecimiento', nombre: 'Inversión y Crecimiento', color: COLORES_GRAFICAS_MIPYME[3], icono: FaChartLine, descripcion: 'Pequeñas mejoras tecnológicas, capacitación, desarrollo de nuevos productos/servicios básicos.' },
  { id: 'reservaImprevistos', nombre: 'Reserva / Imprevistos', color: COLORES_GRAFICAS_MIPYME[4], icono: FaPiggyBank, descripcion: 'Fondo para emergencias o oportunidades inesperadas.' },
];

const getCategoriasPresupuestoInicialMIPYME = (): PresupuestoCategoria[] => {
  const asignaciones = {
    ventasMarketing: 0.25 * TOTAL_PRESUPUESTO_INICIAL_MIPYME,
    operacionesProduccion: 0.35 * TOTAL_PRESUPUESTO_INICIAL_MIPYME,
    gastosAdministrativos: 0.20 * TOTAL_PRESUPUESTO_INICIAL_MIPYME,
    inversionCrecimiento: 0.10 * TOTAL_PRESUPUESTO_INICIAL_MIPYME,
    reservaImprevistos: 0.10 * TOTAL_PRESUPUESTO_INICIAL_MIPYME,
  };
  
  let sumaActual = Object.values(asignaciones).reduce((acc, val) => acc + val, 0);
  if (sumaActual !== TOTAL_PRESUPUESTO_INICIAL_MIPYME && asignaciones.operacionesProduccion) {
    asignaciones.operacionesProduccion += (TOTAL_PRESUPUESTO_INICIAL_MIPYME - sumaActual);
  }
  
  return categoriasPresupuestoBaseMIPYME.map(catBase => ({
    ...catBase,
    asignado: asignaciones[catBase.id as keyof typeof asignaciones] || 0,
    porcentaje: ((asignaciones[catBase.id as keyof typeof asignaciones] || 0) / TOTAL_PRESUPUESTO_INICIAL_MIPYME) * 100,
  }));
};

const OptimizacionRecursosMIPYMEDashboard: React.FC = () => {
  const [presupuestoTotal, setPresupuestoTotal] = useState<number>(TOTAL_PRESUPUESTO_INICIAL_MIPYME);
  const [categoriasPresupuesto, setCategoriasPresupuesto] = useState<PresupuestoCategoria[]>(getCategoriasPresupuestoInicialMIPYME());
  const [prioridadesOptimizacion, setPrioridadesOptimizacion] = useState<PrioridadOptimizacion[]>([
    { id: 'aumentarVentas', nombre: 'Aumentar Ventas', descripcion: 'Impulsar estrategias de marketing y promoción para atraer más clientes.', activa: false, impactoEstimado: '+ Ingresos' },
    { id: 'reducirGastos', nombre: 'Reducir Gastos No Esenciales', descripcion: 'Revisar y optimizar gastos administrativos y operativos superfluos.', activa: true, impactoEstimado: '- Costos' },
    { id: 'mejorarEficiencia', nombre: 'Mejorar Eficiencia Operativa', descripcion: 'Invertir en pequeñas herramientas o capacitación para optimizar procesos.', activa: false, impactoEstimado: '+ Productividad' },
    { id: 'crearReserva', nombre: 'Fortalecer Fondo de Reserva', descripcion: 'Aumentar el colchón financiero para imprevistos o futuras inversiones.', activa: false, impactoEstimado: '+ Solidez Financiera' },
  ]);
  const [sugerenciasRedistribucion, setSugerenciasRedistribucion] = useState<SugerenciaRedistribucion[] | null>(null);
  const [showSugerenciasModal, setShowSugerenciasModal] = useState(false);
  
  useEffect(() => {
    const totalAsignado = categoriasPresupuesto.reduce((sum, cat) => sum + cat.asignado, 0);
    if (Math.abs(totalAsignado - presupuestoTotal) > 0.01) {
      console.warn(`Advertencia MIPYME: El total asignado (${totalAsignado}) no coincide con el presupuesto total (${presupuestoTotal}).`);
    }
    setCategoriasPresupuesto(prev => prev.map(cat => ({
        ...cat,
        porcentaje: (cat.asignado / presupuestoTotal) * 100
    })));
  }, [categoriasPresupuesto, presupuestoTotal]);

  const handlePrioridadChange = (id: PrioridadOptimizacion['id']) => {
    setPrioridadesOptimizacion(prev => prev.map(p => p.id === id ? { ...p, activa: !p.activa } : p));
    setSugerenciasRedistribucion(null);
  };

  const handlePresupuestoCatChange = (id: string, nuevoValorStr: string) => {
    const nuevoValor = parseFloat(nuevoValorStr);
    if (isNaN(nuevoValor) || nuevoValor < 0) {
      // Opcional: mostrar un feedback de error si el valor no es válido
      return;
    }

    setCategoriasPresupuesto(prev => {
        let tempCategorias = prev.map(cat => cat.id === id ? { ...cat, asignado: nuevoValor } : cat);
        const totalAsignadoTemporal = tempCategorias.reduce((sum, cat) => sum + cat.asignado, 0);

        if (totalAsignadoTemporal > presupuestoTotal) {
            alert(`El valor ingresado para "${prev.find(c=>c.id===id)?.nombre}" (${nuevoValor.toLocaleString()}) hace que el total asignado (${totalAsignadoTemporal.toLocaleString()}) exceda el presupuesto total (${presupuestoTotal.toLocaleString()}). Ajuste por favor.`);
            return prev; 
        }
        return tempCategorias;
    });
    setSugerenciasRedistribucion(null); 
  };
  
  const generarSugerenciasRedistribucion = () => {
    let nuevasSugerencias: SugerenciaRedistribucion[] = [];
    let presupuestoModificable = [...categoriasPresupuesto.map(c => ({ ...c }))]; 

    const obtenerCategoria = (id: string) => presupuestoModificable.find(c => c.id === id);
    const moverFondos = (deId: string, aId: string, montoAbsolutoSugerido: number, justificacion: string) => {
        const catDe = obtenerCategoria(deId);
        const catA = obtenerCategoria(aId);
        // Asegurarse que el monto a mover no sea mayor que lo disponible en la categoría origen
        const montoRealAMover = Math.min(montoAbsolutoSugerido, catDe?.asignado || 0);

        if (catDe && catA && catDe.asignado >= montoRealAMover && montoRealAMover > 0) {
            catDe.asignado -= montoRealAMover;
            catA.asignado += montoRealAMover;
            nuevasSugerencias.push({ categoriaId: deId, cambio: -montoRealAMover, justificacion: `Transferido a ${catA.nombre} para: ${justificacion}` });
            nuevasSugerencias.push({ categoriaId: aId, cambio: montoRealAMover, justificacion: `Recibido de ${catDe.nombre} para: ${justificacion}` });
            return true;
        }
        return false;
    };
    
    prioridadesOptimizacion.filter(p => p.activa).forEach(prioridad => {
        const montoPequeno = presupuestoTotal * 0.05; // 5% del total para movimientos
        const montoMedio = presupuestoTotal * 0.08; // 8% del total

        switch (prioridad.id) {
            case 'aumentarVentas':
                moverFondos('reservaImprevistos', 'ventasMarketing', montoPequeno, prioridad.nombre);
                moverFondos('gastosAdministrativos', 'ventasMarketing', montoPequeno, prioridad.nombre);
                break;
            case 'reducirGastos':
                 moverFondos('gastosAdministrativos', 'reservaImprevistos', montoMedio, prioridad.nombre);
                 moverFondos('operacionesProduccion', 'reservaImprevistos', montoPequeno, "Optimización de costos operativos");
                break;
            case 'mejorarEficiencia':
                moverFondos('reservaImprevistos', 'inversionCrecimiento', montoPequeno, prioridad.nombre);
                moverFondos('gastosAdministrativos', 'inversionCrecimiento', montoPequeno, "Inversión en herramientas/capacitación");
                break;
            case 'crearReserva':
                moverFondos('ventasMarketing', 'reservaImprevistos', montoPequeno, prioridad.nombre);
                moverFondos('inversionCrecimiento', 'reservaImprevistos', montoPequeno, "Aumentar solidez financiera");
                break;
        }
    });
    
    if (nuevasSugerencias.length > 0) {
        setSugerenciasRedistribucion(nuevasSugerencias);
    } else {
        setSugerenciasRedistribucion([]); 
    }
    setShowSugerenciasModal(true);
  };

  const aplicarSugerencias = () => {
    if (!sugerenciasRedistribucion) return;

    let presupuestoAplicado = [...categoriasPresupuesto.map(c => ({ ...c }))];
    sugerenciasRedistribucion.forEach(sug => {
        const categoria = presupuestoAplicado.find(c => c.id === sug.categoriaId);
        if (categoria) {
            categoria.asignado += sug.cambio;
             // Asegurar que ninguna categoría quede negativa (aunque la lógica de moverFondos debería prevenirlo)
            if (categoria.asignado < 0) categoria.asignado = 0;
        }
    });
    
    // Re-verificar que el total no exceda el presupuesto (importante si la lógica de sugerencias es compleja)
    let totalFinalSugerido = presupuestoAplicado.reduce((sum, cat) => sum + cat.asignado, 0);
    if (Math.abs(totalFinalSugerido - presupuestoTotal) > 0.01) {
        // Si hay discrepancia, se podría intentar ajustar la categoría más grande o la de reserva
        const diferencia = presupuestoTotal - totalFinalSugerido;
        const catReserva = presupuestoAplicado.find(c => c.id === 'reservaImprevistos');
        if (catReserva) {
            catReserva.asignado += diferencia;
            if (catReserva.asignado < 0) catReserva.asignado = 0; // No dejarla negativa
        }
        // Re-calcular el total para asegurar consistencia
        totalFinalSugerido = presupuestoAplicado.reduce((sum, cat) => sum + cat.asignado, 0);
        if (Math.abs(totalFinalSugerido - presupuestoTotal) > 0.01) {
             alert("Hubo un problema al aplicar las sugerencias y el presupuesto total no cuadra. Revise manualmente.");
             // No aplicar si aún hay problemas serios.
             setSugerenciasRedistribucion(null);
             setShowSugerenciasModal(false);
             return;
        }
    }

    setCategoriasPresupuesto(presupuestoAplicado);
    setSugerenciasRedistribucion(null);
    setShowSugerenciasModal(false);
  };

  const totalAsignadoActual = useMemo(() => categoriasPresupuesto.reduce((sum, cat) => sum + cat.asignado, 0), [categoriasPresupuesto]);
  const presupuestoRestante = presupuestoTotal - totalAsignadoActual;

  const dataGraficaPrincipal = useMemo(() => categoriasPresupuesto.map(cat => ({
    name: cat.nombre,
    value: cat.asignado,
    fill: cat.color,
  })), [categoriasPresupuesto]);

  const dataGraficaSugerencias = useMemo(() => {
    if (!sugerenciasRedistribucion) return null;
    return categoriasPresupuesto.map(catOriginal => {
        const cambioNeto = sugerenciasRedistribucion
            .filter(s => s.categoriaId === catOriginal.id)
            .reduce((acc, curr) => acc + curr.cambio, 0);
        return {
            name: catOriginal.nombre,
            actual: catOriginal.asignado,
            sugerido: Math.max(0, catOriginal.asignado + cambioNeto), // No permitir valores negativos en gráfico
            fillActual: catOriginal.color,
            // Usar un color ligeramente diferente para la barra 'sugerido'
            fillSugerido: `${catOriginal.color}B3`, // Añadir opacidad o un color derivado
        };
    });
  }, [sugerenciasRedistribucion, categoriasPresupuesto]);


  return (
    <Container fluid className="pt-3 pb-5" style={{fontSize: '0.9rem'}}> {/* Tamaño de fuente base reducido */}
      <Card className="shadow-sm mb-3 border-0">
        <Card.Header as="h5" className="bg-dark text-white d-flex align-items-center justify-content-between" style={{fontSize: '1.1rem'}}>
            <div><FaBalanceScale className="me-2" />Optimización de Presupuesto</div>
            <Badge bg="light" text="dark" pill>Presupuesto Total: {presupuestoTotal.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</Badge>
        </Card.Header>
        <Card.Body>
            <Row className="align-items-center">
                <Col md={7}>
                    <h6 className="text-primary mb-0"><FaChartPie className="me-2"/>Distribución Actual del Presupuesto</h6>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie data={dataGraficaPrincipal} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} 
                                labelLine={false}
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5 + 15; // Ajuste para MIPYME
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                                    if (percent * 100 < 5) return null; // No mostrar etiqueta si es muy pequeño
                                    return (
                                        <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="11">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}>
                                {dataGraficaPrincipal.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}
                            </Pie>
                            <Tooltip formatter={(value: number, name: string) => [`${value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`, name]} />
                            <Legend iconSize={10} wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                </Col>
                <Col md={5}>
                    <h6 className="text-primary"><FaSlidersH className="me-2"/>Resumen</h6>
                    <ListGroup variant="flush" className="small">
                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-2">
                            Total Asignado: <Badge bg="primary" pill>{totalAsignadoActual.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}</Badge>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex justify-content-between align-items-center py-2">
                            Restante / Déficit:
                            <Badge bg={presupuestoRestante < 0 ? "danger" : presupuestoRestante === 0 ? "success" : "warning"} pill>
                                {presupuestoRestante.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </Badge>
                        </ListGroup.Item>
                    </ListGroup>
                    {presupuestoRestante < 0 && <Alert variant="danger" className="mt-2 small py-1 px-2">¡Atención! El presupuesto está excedido.</Alert>}
                     <Card className="mt-2 bg-light border-0">
                        <Card.Body className="p-2 small text-muted">
                             Utilice las herramientas de abajo para ajustar manualmente o recibir sugerencias de redistribución.
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm border-0">
        <Card.Header as="h6" className="bg-secondary text-white py-2" style={{fontSize: '1rem'}}><FaRecycle className="me-2" />Herramientas de Optimización</Card.Header>
        <Card.Body>
          <Row>
            <Col md={5} className="border-end pe-md-3">
              <label className="form-label fw-bold small text-dark">1. Prioridades Estratégicas:</label>
              {prioridadesOptimizacion.map(p => (
                <Form.Check type="switch" key={p.id} id={`prioridad-${p.id}`} className="mb-1 small"
                    label={<span title={p.descripcion} className="fw-normal">{p.nombre}</span>} 
                    checked={p.activa} 
                    onChange={() => handlePrioridadChange(p.id)} 
                />
              ))}
              <Button variant="info" size="sm" className="w-100 mt-2" onClick={generarSugerenciasRedistribucion} disabled={!prioridadesOptimizacion.some(p=>p.activa)}>
                Generar Sugerencias
              </Button>
            </Col>
            <Col md={7} className="ps-md-3 mt-3 mt-md-0">
              <label className="form-label fw-bold small text-dark">2. Ajuste Manual de Presupuesto:</label>
              {categoriasPresupuesto.map(cat => (
                <Form.Group as={Row} key={`input-${cat.id}`} className="mb-1 align-items-center">
                  <Form.Label column sm={6} xs={7} className="small text-nowrap pe-0">
                    <cat.icono className="me-1" style={{color: cat.color}}/> {cat.nombre}
                  </Form.Label>
                  <Col sm={6} xs={5}>
                    <InputGroup size="sm">
                       <Form.Control 
                            type="number" 
                            value={cat.asignado.toString()}
                            onChange={e => handlePresupuestoCatChange(cat.id, e.target.value)} 
                            step="100" // Ajustado para MIPYMES
                            className="py-1"
                        />
                       <InputGroup.Text style={{minWidth: '55px'}} className="py-1">{cat.porcentaje?.toFixed(0) || 0}%</InputGroup.Text>
                    </InputGroup>
                  </Col>
                </Form.Group>
              ))}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {sugerenciasRedistribucion && (
        <Modal show={showSugerenciasModal} onHide={() => {setShowSugerenciasModal(false); setSugerenciasRedistribucion(null);}} size="lg" centered>
          <Modal.Header closeButton className="bg-light py-2">
            <Modal.Title className="text-primary h6"><FaLightbulb className="me-2"/>Sugerencias de Redistribución</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {sugerenciasRedistribucion.length === 0 ? (
                <Alert variant="info" className="small">No se generaron cambios significativos. El presupuesto parece alineado con las prioridades o no hay margen claro para optimización con las reglas actuales.</Alert>
            ) : (
            <Row>
                <Col md={12}> {/* Un solo gráfico para MIPYMES puede ser más claro */}
                    <h6 className="small fw-bold"><FaChartPie className="me-1" />Comparativa Gráfica (Actual vs. Sugerido):</h6>
                    {dataGraficaSugerencias && (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={dataGraficaSugerencias} margin={{ top: 5, right: 5, left: 5, bottom: 60 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} style={{fontSize: '10px'}}/>
                                <YAxis tickFormatter={(value) => value.toLocaleString([], {notation: 'compact'})} style={{fontSize: '10px'}}/>
                                <Tooltip formatter={(value: number) => value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })} />
                                <Legend wrapperStyle={{fontSize: '11px'}} iconSize={8}/>
                                <Bar dataKey="actual" name="Actual" fillOpacity={0.7}>
                                    {dataGraficaSugerencias.map((entry, index) => (<Cell key={`cell-a-${index}`} fill={entry.fillActual} />))}
                                </Bar>
                                <Bar dataKey="sugerido" name="Sugerido" fillOpacity={0.9}>
                                    {dataGraficaSugerencias.map((entry, index) => (<Cell key={`cell-s-${index}`} fill={entry.fillSugerido} />))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </Col>
                <Col md={12} className="mt-3">
                    <h6 className="small fw-bold"><FaRecycle className="me-1" />Detalle de Cambios Sugeridos:</h6>
                    <Table striped bordered hover size="sm" responsive className="small">
                        <thead className="table-light"><tr><th>Categoría</th><th>Cambio Sugerido</th><th>Justificación</th></tr></thead>
                        <tbody>
                        {categoriasPresupuesto.map(cat => {
                            const cambioNeto = sugerenciasRedistribucion.filter(s => s.categoriaId === cat.id).reduce((acc, curr) => acc + curr.cambio, 0);
                            const justificaciones = sugerenciasRedistribucion.filter(s => s.categoriaId === cat.id && s.cambio !== 0).map(s => s.justificacion).join("; ");
                            if (Math.abs(cambioNeto) < 0.01) return null; // No mostrar si el cambio es despreciable
                            return (
                                <tr key={cat.id}>
                                    <td><cat.icono className="me-1" />{cat.nombre}</td>
                                    <td className={cambioNeto > 0 ? 'text-success' : 'text-danger'}>
                                        {cambioNeto > 0 ? '+' : ''}{cambioNeto.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                                    </td>
                                    <td className="small">{justificaciones || "Ajuste general"}</td>
                                </tr>
                            );
                        }).filter(Boolean)}
                        </tbody>
                    </Table>
                </Col>
            </Row>
            )}
          </Modal.Body>
          <Modal.Footer className="py-2">
            <Button variant="outline-secondary" size="sm" onClick={() => {setShowSugerenciasModal(false); setSugerenciasRedistribucion(null);}}>
                <FaTimesCircle className="me-1"/>Descartar
            </Button>
            {sugerenciasRedistribucion && sugerenciasRedistribucion.length > 0 &&
                <Button variant="success" size="sm" onClick={aplicarSugerencias}>
                    <FaCheckCircle className="me-1"/>Aplicar Sugerencias
                </Button>
            }
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default OptimizacionRecursosMIPYMEDashboard;