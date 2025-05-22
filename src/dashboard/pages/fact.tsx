import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Button, Card, Table, ProgressBar, Tabs, Tab, Alert, ListGroup, Badge, Modal } from "react-bootstrap";
import { FaUniversity, FaFileInvoiceDollar, FaRegFileAlt, FaHandHoldingUsd, FaCalculator, FaBriefcase, FaChartLine, FaDownload, FaSyncAlt, FaPaperclip, FaPercentage, FaSearch, FaPlus, FaEye, FaFilePdf, FaFileCode, FaFileExcel, FaFileCsv } from 'react-icons/fa';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

// Interfaces del archivo FacturasLandingPage.tsx (adaptadas si es necesario)
export interface TaxStamp {
  uuid: string;
  date: string;
  satCertNumber: string;
  satSign: string;
  cfdiSign: string;
  rfcProvCertif: string;
}

export interface Issuer {
  fiscalRegime: string;
  rfc: string;
  taxName: string;
}

export interface Receiver {
  rfc: string;
  name: string;
}

export interface Item {
  discount: number;
  quantity: number;
  unit: string;
  description: string;
  unitValue: number;
  total: number;
  tax?: Tax; // Opcional, si el impuesto es por item
}

export interface Tax {
  total: number;
  name: string; // e.g., "IVA", "ISR Retenido"
  rate: number;
  type: "transferred" | "retained"; // Tipo de impuesto
  isLocal?: boolean; // Para diferenciar impuestos locales
}

export interface Factura {
  uuid: string;
  serie: string;
  folio: string;
  fecha: string; // ISO Date string
  paymentTerms: string; // e.g. "PUE", "PPD"
  paymentConditions: string; // e.g. "Contado", "Crédito 30 días"
  paymentMethod: string; // e.g. "01 Efectivo", "03 Transferencia"
  expeditionPlace: string; // Código Postal
  currency: string; // e.g. "MXN", "USD"
  subtotal: number;
  discount: number;
  total: number;
  estado: "Activo" | "Cancelado" | "Pendiente"; // Estado de la factura
  issuer: Issuer;
  receiver: Receiver;
  items: Item[];
  taxes: Tax[]; // Impuestos globales de la factura
  taxStamp?: TaxStamp; // Timbre fiscal, puede ser opcional si es una pre-factura
  relatedCfdi?: string; // Para notas de crédito, etc.
  notes?: string; // Notas adicionales
}

// Componente FacturaModal (adaptado e integrado)
const FacturaModalInternal: React.FC<{ show: boolean; onClose: () => void; onSave: (factura: Factura) => void; initialFactura?: Partial<Factura> }> = ({ show, onClose, onSave, initialFactura }) => {
  const [facturaData, setFacturaData] = useState<Partial<Factura>>(
    initialFactura || {
      serie: "F",
      folio: `${Math.floor(Math.random() * 9000) + 1000}`, // Folio aleatorio
      fecha: new Date().toISOString().split('T')[0],
      paymentTerms: "PUE - Pago en una sola exhibición",
      paymentConditions: "Contado",
      paymentMethod: "03 - Transferencia electrónica de fondos",
      expeditionPlace: "64000", // CP de Monterrey como ejemplo
      currency: "MXN",
      subtotal: 0,
      discount: 0,
      total: 0,
      estado: "Activo",
      issuer: { fiscalRegime: "601 - General de Ley Personas Morales", rfc: "TUR123456789", taxName: "TOUR OPERADORA MEXICANA SA DE CV" },
      receiver: { rfc: "", name: "" },
      items: [{ quantity: 1, unit: "PZA", description: "", unitValue: 0, total: 0, discount: 0 }],
      taxes: [{ name: "IVA", rate: 16, total: 0, type: "transferred" }],
    }
  );
  const [newItem, setNewItem] = useState<Partial<Item>>({ quantity: 1, unit: "PZA", description: "", unitValue: 0, total: 0, discount: 0 });

  useEffect(() => {
    // Recalcular totales cuando cambian items o descuento global
    let currentSubtotal = facturaData.items?.reduce((sum, item) => sum + (item.total || 0), 0) || 0;
    const globalDiscount = facturaData.discount || 0;
    currentSubtotal -= globalDiscount; // Aplicar descuento global si existe antes de impuestos

    let taxesTotal = 0;
    const calculatedTaxes: Tax[] = [];
    if (facturaData.taxes) {
        facturaData.taxes.forEach(tax => {
            const taxAmount = currentSubtotal * (tax.rate / 100);
            taxesTotal += taxAmount;
            calculatedTaxes.push({ ...tax, total: taxAmount });
        });
    }
    
    setFacturaData(prev => ({
        ...prev,
        subtotal: prev.items?.reduce((sum, item) => sum + (item.quantity * item.unitValue), 0) || 0, // Subtotal antes de descuento de items
        // El total de items ya debería tener descuentos por item aplicados
        total: currentSubtotal + taxesTotal,
        taxes: calculatedTaxes
    }));

  }, [facturaData.items, facturaData.discount, facturaData.taxes?.[0]?.rate]);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, section?: keyof Factura, subField?: string) => {
    const { name, value } = e.target;
    if (section) {
      setFacturaData(prev => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          [subField || name]: value
        }
      }));
    } else {
      setFacturaData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleItemChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const items = [...(facturaData.items || [])];
    const numericValue = name === "quantity" || name === "unitValue" || name === "discount" ? parseFloat(value) : value;
    items[index] = { ...items[index], [name]: numericValue } as Item;

    // Recalcular total del item
    const item = items[index];
    item.total = (item.quantity * item.unitValue) - (item.discount || 0);
    
    setFacturaData(prev => ({ ...prev, items }));
  };

  const addItem = () => {
    setFacturaData(prev => ({ ...prev, items: [...(prev.items || []), { ...newItem, total: (newItem.quantity || 0) * (newItem.unitValue || 0) - (newItem.discount || 0) } as Item] }));
    setNewItem({ quantity: 1, unit: "PZA", description: "", unitValue: 0, total: 0, discount: 0 });
  };
  
  const removeItem = (index: number) => {
    setFacturaData(prev => ({ ...prev, items: prev.items?.filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    const finalFactura: Factura = {
      uuid: initialFactura?.uuid || `SIM-${Date.now()}`, // Generar UUID simulado si es nueva
      ...facturaData,
      taxStamp: facturaData.taxStamp || { // Asegurar que taxStamp exista
        uuid: initialFactura?.uuid || `SIM-${Date.now()}`, // Usar el mismo UUID de la factura
        date: new Date().toISOString(),
        cfdiSign: `SIM-CFDI-SIGN-${Date.now().toString(36)}`,
        satCertNumber: "30001000000500000000", // Número de certificado SAT de prueba
        satSign: `SIM-SAT-SIGN-${Date.now().toString(36)}`,
        rfcProvCertif: "SAT970701NN3" // RFC del PAC de prueba
      }
    } as Factura; // Type assertion
    onSave(finalFactura);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{initialFactura?.uuid ? "Editar Factura" : "Nueva Factura (Simulada)"}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Tabs defaultActiveKey="general" className="mb-3">
            <Tab eventKey="general" title="General">
              <Row>
                <Col md={4}><Form.Group><Form.Label>Serie</Form.Label><Form.Control type="text" name="serie" value={facturaData.serie} onChange={handleInputChange} /></Form.Group></Col>
                <Col md={4}><Form.Group><Form.Label>Folio</Form.Label><Form.Control type="text" name="folio" value={facturaData.folio} onChange={handleInputChange} /></Form.Group></Col>
                <Col md={4}><Form.Group><Form.Label>Fecha</Form.Label><Form.Control type="date" name="fecha" value={facturaData.fecha?.split('T')[0]} onChange={handleInputChange} /></Form.Group></Col>
              </Row>
              {/* ... más campos generales ... */}
              <Row className="mt-2">
                 <Col md={6}><Form.Group><Form.Label>Método de Pago</Form.Label><Form.Control as="select" name="paymentMethod" value={facturaData.paymentMethod} onChange={handleInputChange}><option>01 - Efectivo</option><option>03 - Transferencia electrónica de fondos</option><option>04 - Tarjeta de crédito</option><option>28 - Tarjeta de débito</option></Form.Control></Form.Group></Col>
                 <Col md={6}><Form.Group><Form.Label>Condiciones de Pago</Form.Label><Form.Control type="text" name="paymentConditions" value={facturaData.paymentConditions} onChange={handleInputChange} /></Form.Group></Col>
              </Row>
               <Row className="mt-2">
                 <Col md={6}><Form.Group><Form.Label>Moneda</Form.Label><Form.Control as="select" name="currency" value={facturaData.currency} onChange={handleInputChange}><option>MXN</option><option>USD</option></Form.Control></Form.Group></Col>
                 <Col md={6}><Form.Group><Form.Label>Lugar de Expedición (CP)</Form.Label><Form.Control type="text" name="expeditionPlace" value={facturaData.expeditionPlace} onChange={handleInputChange} /></Form.Group></Col>
              </Row>
            </Tab>
            <Tab eventKey="emitter" title="Emisor">
              <Form.Group><Form.Label>Nombre Fiscal</Form.Label><Form.Control type="text" name="taxName" value={facturaData.issuer?.taxName} onChange={(e) => handleInputChange(e, "issuer")} /></Form.Group>
              <Form.Group className="mt-2"><Form.Label>RFC</Form.Label><Form.Control type="text" name="rfc" value={facturaData.issuer?.rfc} onChange={(e) => handleInputChange(e, "issuer")} /></Form.Group>
              <Form.Group className="mt-2"><Form.Label>Régimen Fiscal</Form.Label><Form.Control type="text" name="fiscalRegime" value={facturaData.issuer?.fiscalRegime} onChange={(e) => handleInputChange(e, "issuer")} /></Form.Group>
            </Tab>
            <Tab eventKey="receiver" title="Receptor">
              <Form.Group><Form.Label>Nombre</Form.Label><Form.Control type="text" name="name" value={facturaData.receiver?.name} onChange={(e) => handleInputChange(e, "receiver")} /></Form.Group>
              <Form.Group className="mt-2"><Form.Label>RFC</Form.Label><Form.Control type="text" name="rfc" value={facturaData.receiver?.rfc} onChange={(e) => handleInputChange(e, "receiver")} /></Form.Group>
            </Tab>
            <Tab eventKey="items" title="Conceptos">
              {facturaData.items?.map((item, index) => (
                <Card key={index} className="mb-2">
                  <Card.Body>
                    <Row>
                      <Col md={5}><Form.Group><Form.Label>Descripción</Form.Label><Form.Control type="text" name="description" value={item.description} onChange={(e) => handleItemChange(index, e as any)} /></Form.Group></Col>
                      <Col md={2}><Form.Group><Form.Label>Cant.</Form.Label><Form.Control type="number" name="quantity" value={item.quantity} onChange={(e) => handleItemChange(index, e as any)} /></Form.Group></Col>
                      <Col md={2}><Form.Group><Form.Label>Unidad</Form.Label><Form.Control type="text" name="unit" value={item.unit} onChange={(e) => handleItemChange(index, e as any)} /></Form.Group></Col>
                      <Col md={3}><Form.Group><Form.Label>P. Unitario</Form.Label><Form.Control type="number" name="unitValue" value={item.unitValue} onChange={(e) => handleItemChange(index, e as any)} /></Form.Group></Col>
                    </Row>
                    <Row className="mt-1">
                      <Col md={3}><Form.Group><Form.Label>Descuento</Form.Label><Form.Control type="number" name="discount" value={item.discount || 0} onChange={(e) => handleItemChange(index, e as any)} /></Form.Group></Col>
                      <Col md={3}><Form.Group><Form.Label>Total Concepto</Form.Label><Form.Control type="text" readOnly value={item.total?.toFixed(2)} /></Form.Group></Col>
                      <Col md={2} className="d-flex align-items-end"><Button variant="outline-danger" size="sm" onClick={() => removeItem(index)}>Eliminar</Button></Col>
                    </Row>
                  </Card.Body>
                </Card>
              ))}
              <Button variant="outline-success" size="sm" onClick={addItem} className="mt-2">Añadir Concepto</Button>
            </Tab>
             <Tab eventKey="summary" title="Resumen y Totales">
                <Row className="mt-3">
                    <Col md={6}>
                        <Form.Group><Form.Label>Subtotal General</Form.Label><Form.Control type="text" readOnly value={facturaData.subtotal?.toFixed(2)} /></Form.Group>
                        <Form.Group className="mt-2"><Form.Label>Descuento Global</Form.Label><Form.Control type="number" name="discount" value={facturaData.discount || 0} onChange={handleInputChange} /></Form.Group>
                    </Col>
                    <Col md={6}>
                        {facturaData.taxes?.map((tax, index) => (
                            <Form.Group key={index} className="mt-2">
                                <Form.Label>{tax.name} ({tax.rate}%)</Form.Label>
                                <Form.Control type="text" readOnly value={tax.total?.toFixed(2)} />
                            </Form.Group>
                        ))}
                        <Form.Group className="mt-3 fw-bold"><Form.Label>TOTAL FACTURA</Form.Label><Form.Control type="text" readOnly value={facturaData.total?.toFixed(2)} style={{fontSize: '1.2em', color: 'green'}} /></Form.Group>
                    </Col>
                </Row>
            </Tab>
          </Tabs>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={handleSave}>Guardar Factura</Button>
      </Modal.Footer>
    </Modal>
  );
};


const TaxAndFinancingIntegrationDashboardWithInvoicing: React.FC = () => {
  // Estados del dashboard original
  const [satConnected, setSatConnected] = useState<boolean>(true);
  const [lastSync, setLastSync] = useState<string>(new Date().toLocaleString());
  const [fiscalDocuments, setFiscalDocuments] = useState<FiscalDocument[]>([
    { id: "FAC001", name: "Factura Venta A015", type: "Factura", date: "2025-05-20", status: "Disponible" },
    { id: "DEC001", name: "Declaración Mensual IVA - Abril 2025", type: "Declaración", date: "2025-05-15", status: "Disponible" },
  ]);
  const [companyName, setCompanyName] = useState<string>("Mi Empresa Turística S.A. de C.V.");
  const [creditPackage, setCreditPackage] = useState<CreditDocument[] | null>(null);
  const [financialScore, setFinancialScore] = useState<number | null>(null);
  const [generatingPackage, setGeneratingPackage] = useState<boolean>(false);
  const [taxableIncome, setTaxableIncome] = useState<number>(150000);
  const [tourismServiceType, setTourismServiceType] = useState<string>("Hospedaje");
  const [calculatedTaxes, setCalculatedTaxes] = useState<{ iva: number; isr: number; local: number; exemptions: string[] } | null>(null);
  const [calculatingTaxes, setCalculatingTaxes] = useState<boolean>(false);

  // Estados de FacturasLandingPage
  const [invoices, setInvoices] = useState<Factura[]>([]);
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(5); // Menos items por página para la demo integrada
  const [selectedInvoice, setSelectedInvoice] = useState<Factura | null>(null);
  const [showFacturaModal, setShowFacturaModal] = useState<boolean>(false);
  const [facturaModalType, setFacturaModalType] = useState<"PDF" | "XML" | "VIEW" | "NEW" | "">("");
  const [showFacturaExtras, setShowFacturaExtras] = useState<boolean>(false);


  useEffect(() => {
    const exampleFacturas: Factura[] = [{
        uuid: "D4E5F6A1-B2C3-4567-8901-2DEF34567890",
        serie: "T",
        folio: "101",
        fecha: "2025-07-01T10:00:00",
        paymentTerms: "PUE", paymentConditions: "CONTADO", paymentMethod: "04", expeditionPlace: "64000", currency: "MXN",
        subtotal: 13500.0, discount: 500.0, total: 15160.0, estado: "Activo",
        issuer: { fiscalRegime: "601", rfc: "TUR123456789", taxName: "TOUR OPERADORA MEXICANA SA DE CV" },
        receiver: { rfc: "CLI999888777", name: "LAURA MARTÍNEZ" },
        items: [ { discount: 0.0, quantity: 2, unit: "PZA", description: "Tour a Teotihuacán (adulto)", unitValue: 2000.0, total: 4000.0 }, { discount: 0.0, quantity: 3, unit: "PZA", description: "Tour a Xochimilco (adulto)", unitValue: 2000.0, total: 6000.0 }, { discount: 0.0, quantity: 1, unit: "PZA", description: "Tour a Chichen Itzá (adulto)", unitValue: 4500.0, total: 4500.0 } ],
        taxes: [ { total: 2160.0, name: "IVA", rate: 16.0, type: "transferred" } ],
        taxStamp: { uuid: "D4E5F6A1-B2C3-4567-8901-2DEF34567890", date: "2025-07-01T10:05:00", cfdiSign: "FAKE-CFDI-SIGN-MULTITOUR", satCertNumber: "30001000000300023792", satSign: "FAKE-SAT-SIGN-MULTITOUR", rfcProvCertif: "TURPROVCERT126" }
      },
      {
        uuid: "A1B2C3D4-E5F6-7890-1234-56789ABCDEF0",
        serie: "T", folio: "102", fecha: "2025-06-01T09:00:00", paymentTerms: "PUE", paymentConditions: "ANTICIPO 50%", paymentMethod: "01", expeditionPlace: "64000", currency: "MXN",
        subtotal: 8000.0, discount: 500.0, total: 8700.0, estado: "Activo",
        issuer: { fiscalRegime: "601", rfc: "TUR123456789", taxName: "TOUR OPERADORA MEXICANA SA DE CV" },
        receiver: { rfc: "CLI987654321", name: "JUAN PÉREZ" },
        items: [ { discount: 0.0, quantity: 4, unit: "PZA", description: "Tour a Teotihuacán (adulto)", unitValue: 2000.0, total: 8000.0 } ],
        taxes: [ { total: 1200.0, name: "IVA", rate: 16.0, type: "transferred" } ],
        taxStamp: { uuid: "A1B2C3D4-E5F6-7890-1234-56789ABCDEF0", date: "2025-06-01T09:05:00", cfdiSign: "FAKE-CFDI-SIGN-TOUR", satCertNumber: "30001000000300023789", satSign: "FAKE-SAT-SIGN-TOUR", rfcProvCertif: "TURPROVCERT123" }
      }];
    const stored = localStorage.getItem("facturasIntegratedDemo");
    let facturasGuardadas: Factura[] = [];
    if (stored) { try { facturasGuardadas = JSON.parse(stored); } catch { /* ignore */ } }
    exampleFacturas.forEach(example => { if (!facturasGuardadas.some(f => f.uuid === example.uuid)) { facturasGuardadas.push(example); } });
    setInvoices(facturasGuardadas);
  }, []);

  useEffect(() => {
    if (invoices.length > 0) { // Solo guardar si hay facturas para no sobreescribir con vacío al inicio
        localStorage.setItem("facturasIntegratedDemo", JSON.stringify(invoices));
    }
  }, [invoices]);

  // Funciones del dashboard original
  const handleDownloadFiscalDocument = (docId: string) => alert(`Simulando descarga del documento fiscal: ${docId}`);
  const handleGenerateCreditPackage = () => { /* ... (código original sin cambios) ... */ 
    setGeneratingPackage(true);
    setCreditPackage(null);
    setFinancialScore(null);
    setTimeout(() => {
      const score = Math.floor(Math.random() * (900 - 650 + 1)) + 650;
      setFinancialScore(score);
      setCreditPackage([
        { id: "CDOC01", name: "Constancia de Situación Fiscal (CSF)", category: "Fiscal" },
        { id: "CDOC02", name: "Últimas 3 Declaraciones Mensuales", category: "Fiscal" },
        { id: "CDOC06", name: `Reporte de Score Financiero Interno (${score})`, category: "Análisis" },
      ]);
      setGeneratingPackage(false);
    }, 1500);
  };
  const handleCalculateSectoralTaxes = () => { /* ... (código original sin cambios) ... */ 
    setCalculatingTaxes(true);
    setCalculatedTaxes(null);
    setTimeout(() => {
      let ivaRate = 0.16; let isrRate = 0.30; let localContributionRate = 0.03; const exemptionsApplied: string[] = [];
      if (tourismServiceType === "Tour Operador Ecológico Certificado") { isrRate = 0.25; exemptionsApplied.push("Tasa ISR reducida para Tour Operador Ecológico."); }
      if (taxableIncome < 100000) { localContributionRate = 0.02; exemptionsApplied.push("Tasa local reducida para ingresos menores.");}
      if (tourismServiceType === "Servicios Turísticos a Extranjeros (Exportación)") { ivaRate = 0.00; exemptionsApplied.push("IVA Tasa 0% a servicios de exportación turística.");}
      const iva = taxableIncome * ivaRate; const isr = taxableIncome * isrRate; const local = taxableIncome * localContributionRate;
      setCalculatedTaxes({ iva, isr, local, exemptions: exemptionsApplied.length > 0 ? exemptionsApplied : ["No se aplicaron exenciones específicas."] });
      setCalculatingTaxes(false);
    }, 1200);
  };

  // Funciones de FacturasLandingPage
  const filteredInvoices = invoices.filter((inv) =>
    inv.receiver.name.toLowerCase().includes(search.toLowerCase()) ||
    inv.receiver.rfc.toLowerCase().includes(search.toLowerCase()) ||
    inv.folio.toLowerCase().includes(search.toLowerCase()) ||
    inv.uuid.toLowerCase().includes(search.toLowerCase())
  );
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage);

  const openFacturaModalHandler = (factura: Factura | null, type: "PDF" | "XML" | "VIEW" | "NEW") => {
    setSelectedInvoice(factura);
    setFacturaModalType(type);
    setShowFacturaModal(true);
  };
  const closeFacturaModalHandler = () => {
    setShowFacturaModal(false); setSelectedInvoice(null); setFacturaModalType(""); setShowFacturaExtras(false);
  };

  const exportFacturaToPDF = (factura: Factura) => {
    const doc = new jsPDF("p", "mm", "a4");

    // Header
    doc.setFillColor(41, 128, 185);
    doc.rect(0, 0, 210, 30, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text(`Factura ${factura.serie}-${factura.folio}`, 14, 20);

    // Datos generales
    let y = 38;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Datos Generales", 14, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Fecha:", 14, y);
    doc.text(`${new Date(factura.fecha).toLocaleDateString()}`, 50, y);
    y += 8;
    doc.text("Estado:", 14, y);
    doc.text(`${factura.estado}`, 50, y);
    y += 8;
    doc.text("Cliente:", 14, y);
    doc.text(`${factura.receiver.name}`, 50, y);
    y += 8;
    doc.text("RFC:", 14, y);
    doc.text(`${factura.receiver.rfc}`, 50, y);
    y += 8;
    doc.text("Método de Pago:", 14, y);
    doc.text(`${factura.paymentMethod}`, 50, y);
    y += 8;
    doc.text("Condiciones:", 14, y);
    doc.text(`${factura.paymentConditions}`, 50, y);
    y += 8;
    doc.text("Moneda:", 14, y);
    doc.text(`${factura.currency}`, 50, y);
    y += 8;
    doc.text("Lugar de Expedición:", 14, y);
    doc.text(`${factura.expeditionPlace}`, 50, y);

    // Emisor
    y += 12;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Emisor", 14, y);
    y += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Nombre:", 14, y);
    doc.text(`${factura.issuer.taxName}`, 50, y);
    y += 8;
    doc.text("RFC:", 14, y);
    doc.text(`${factura.issuer.rfc}`, 50, y);
    y += 8;
    doc.text("Régimen Fiscal:", 14, y);
    doc.text(`${factura.issuer.fiscalRegime}`, 50, y);

    // Subtotales y totales
    y += 12;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Totales", 14, y);
    y += 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", 14, y);
    doc.text(`$${factura.subtotal.toFixed(2)}`, 50, y);
    y += 8;
    doc.text("Descuento:", 14, y);
    doc.text(`$${factura.discount.toFixed(2)}`, 50, y);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.text("Total:", 14, y);
    doc.text(`$${factura.total.toFixed(2)}`, 50, y);
    doc.setFont("helvetica", "normal");

    // Conceptos
    y += 12;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("Conceptos", 14, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [[
        "Descripción",
        "Cantidad",
        "Unidad",
        "Unitario",
        "Desc.",
        "Total"
      ]],
      body: factura.items.map((item) => [
        item.description,
        item.quantity,
        item.unit,
        `$${item.unitValue.toFixed(2)}`,
        `$${item.discount.toFixed(2)}`,
        `$${item.total.toFixed(2)}`
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 248, 255] },
      margin: { left: 14, right: 14 }
    });

    // Impuestos (si existen)
    if (factura.taxes && factura.taxes.length > 0) {
      let yImp = (doc as any).lastAutoTable.finalY + 12;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(41, 128, 185);
      doc.text("Impuestos", 14, yImp);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      factura.taxes.forEach((tax, idx) => {
        doc.text(
          `${tax.name} (${tax.rate}%): $${tax.total.toFixed(2)} (${tax.type === "transferred" ? "TRASLADADO" : tax.type.toUpperCase()})`,
          25,
          yImp + 8 + idx * 8
        );
      });
    }

    // Timbre fiscal (si existe)
    if (factura.taxStamp) {
      let yTimbre = (doc as any).lastAutoTable.finalY + 32;
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.setFont("helvetica", "bold");
      doc.text("Timbre Fiscal Digital", 14, yTimbre);
      doc.setFont("helvetica", "normal");
      doc.text(
        `UUID: ${factura.taxStamp.uuid}`,
        14,
        yTimbre + 8
      );
      doc.text(
        `Certificado SAT: ${factura.taxStamp.satCertNumber}`,
        14,
        yTimbre + 16
      );
      doc.text(
        `Fecha: ${new Date(factura.taxStamp.date).toLocaleString()}`,
        14,
        yTimbre + 24
      );
    }

    doc.save(`Factura_${factura.serie}-${factura.folio}.pdf`);
  };
  const handleDownloadXML = (factura: Factura) => { /* ... (código original sin cambios) ... */ 
    const xml = `<Factura><Serie>${factura.serie}</Serie><Folio>${factura.folio}</Folio><Total>${factura.total.toFixed(2)}</Total></Factura>`; // Simplificado
    const blob = new Blob([xml], { type: "application/xml" }); const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `Factura_${factura.serie}-${factura.folio}.xml`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };
  const handleDownloadXLSX = (factura: Factura) => { /* ... (código original sin cambios) ... */ 
     const general = [ ["Serie", factura.serie], ["Folio", factura.folio], ["Total", factura.total] ];
     const conceptos = factura.items.map(item => ({ Descripción: item.description, Cantidad: item.quantity, Total: item.total }));
     const wb = XLSX.utils.book_new(); const wsGeneral = XLSX.utils.aoa_to_sheet(general); XLSX.utils.book_append_sheet(wb, wsGeneral, "General");
     const wsConceptos = XLSX.utils.json_to_sheet(conceptos); XLSX.utils.book_append_sheet(wb, wsConceptos, "Conceptos");
     XLSX.writeFile(wb, `Factura_${factura.serie}-${factura.folio}.xlsx`);
  };
   const handleDownloadCSV = (factura: Factura) => {
    const conceptos = factura.items.map(item => ({ Descripción: item.description, Cantidad: item.quantity, Unidad: item.unit, Unitario: item.unitValue, Descuento: item.discount, Total: item.total }));
    const ws = XLSX.utils.json_to_sheet(conceptos); const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: "text/csv" }); const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = `Factura_Conceptos_${factura.serie}-${factura.folio}.csv`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleSaveFacturaFromModal = (factura: Factura) => {
    setInvoices(prevInvoices => {
        const existingIndex = prevInvoices.findIndex(inv => inv.uuid === factura.uuid);
        if (existingIndex > -1) {
            const updatedInvoices = [...prevInvoices];
            updatedInvoices[existingIndex] = factura;
            return updatedInvoices;
        } else {
            return [factura, ...prevInvoices];
        }
    });
    closeFacturaModalHandler();
  };


  return (
    <Container fluid style={{ padding: "2rem", backgroundColor: "#f4f7f9" }}>
      <Row className="mb-4">
        <Col>
          <h1 style={{ color: "#2c3e50", fontWeight: "bold", borderBottom: "3px solid #f39c12", paddingBottom: "0.5rem" }}>
            <FaUniversity style={{ marginRight: "15px", color: "#f39c12" }} />
            Integración Fiscal, Financiamiento y Facturación
          </h1>
        </Col>
      </Row>

      <Tabs defaultActiveKey="facturacion" id="main-functionality-tabs" className="mb-3 nav-tabs-professional" fill>
        {/* Pestaña de Facturación Integrada */}
        <Tab eventKey="facturacion" title={<><FaFileInvoiceDollar className="me-2" /> Gestión de Facturas (CFDI)</>}>
            <Card className="shadow-sm mt-3">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0 text-dark">Listado de Facturas Emitidas</h5>
                    <Button variant="primary" size="sm" onClick={() => openFacturaModalHandler(null, "NEW")}>
                        <FaPlus className="me-1"/> Nueva Factura
                    </Button>
                </Card.Header>
                <Card.Body>
                    <Row className="mb-3">
                        <Col md={6}>
                            <Form.Control type="text" placeholder="Buscar por Cliente, RFC, Folio o UUID..." value={search} onChange={(e) => setSearch(e.target.value)} />
                        </Col>
                         <Col md={6} className="d-flex justify-content-end align-items-center">
                            <FaSearch className="me-2 text-muted"/> Mostrando {currentInvoices.length} de {filteredInvoices.length} facturas.
                        </Col>
                    </Row>
                    <Table striped bordered hover responsive size="sm">
                        <thead className="table-light">
                            <tr><th>Folio</th><th>Cliente</th><th>RFC</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th></tr>
                        </thead>
                        <tbody>
                            {currentInvoices.map((factura) => (
                                <tr key={factura.uuid}>
                                    <td>{factura.serie}-{factura.folio}</td>
                                    <td>{factura.receiver.name}</td>
                                    <td>{factura.receiver.rfc}</td>
                                    <td>{new Date(factura.fecha).toLocaleDateString()}</td>
                                    <td>${factura.total.toLocaleString("es-MX", {minimumFractionDigits: 2})}</td>
                                    <td><Badge bg={factura.estado === "Activo" ? "success" : factura.estado === "Cancelado" ? "danger" : "warning"}>{factura.estado}</Badge></td>
                                    <td>
                                        <Button variant="outline-info" size="sm" className="me-1" onClick={() => openFacturaModalHandler(factura, "VIEW")} title="Ver Detalle"><FaEye /></Button>
                                        <Button variant="outline-secondary" size="sm" className="me-1" onClick={() => exportFacturaToPDF(factura)} title="Generar PDF"><FaFilePdf /></Button>
                                        <Button variant="outline-success" size="sm" className="me-1" onClick={() => handleDownloadXML(factura)} title="Descargar XML"><FaFileCode /></Button>
                                        <Button variant="outline-warning" size="sm" className="me-1" onClick={() => handleDownloadXLSX(factura)} title="Descargar XLSX"><FaFileExcel/></Button>
                                        <Button variant="outline-dark" size="sm" onClick={() => handleDownloadCSV(factura)} title="Descargar CSV (Conceptos)"><FaFileCsv/></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    {totalPages > 1 && (
                        <nav className="mt-3 d-flex justify-content-center">
                            <ul className="pagination pagination-sm">
                                {[...Array(totalPages)].map((_, i) => (
                                <li key={i} className={`page-item ${currentPage === i + 1 ? "active" : ""}`}>
                                    <Button variant="link" className="page-link" onClick={() => setCurrentPage(i + 1)}>{i + 1}</Button>
                                </li>
                                ))}
                            </ul>
                        </nav>
                    )}
                </Card.Body>
            </Card>
        </Tab>

        <Tab eventKey="satConnection" title={<><FaSyncAlt className="me-2" /> Conexión SAT y Financiamiento</>}>
          <Row className="mt-3">
            <Col md={7}>
              <Card className="shadow-sm h-100">
                <Card.Header as="h5" className="bg-light text-dark d-flex align-items-center"><FaSyncAlt className="me-2 text-primary"/>Conexión con SAT y Entidades Financieras</Card.Header>
                <Card.Body>
                  <Alert variant={satConnected ? "success" : "danger"}>Estado de conexión SAT: {satConnected ? "Conectado" : "Desconectado"} {satConnected && <small className="d-block">Última sincronización: {lastSync}</small>}</Alert>
                  <h6 className="mt-4"><FaDownload className="me-2"/>Descarga Automática de Documentos Fiscales</h6>
                  <Table striped bordered hover responsive size="sm" className="mt-2">
                    <thead className="table-light"><tr><th>Nombre Documento</th><th>Tipo</th><th>Fecha</th><th>Estado</th><th>Acción</th></tr></thead>
                    <tbody>{fiscalDocuments.map(doc => (<tr key={doc.id}><td>{doc.name}</td><td><Badge bg={doc.type === "Factura" ? "info" : doc.type === "Declaración" ? "warning" : "secondary"}>{doc.type}</Badge></td><td>{doc.date}</td><td><Badge bg={doc.status === "Disponible" ? "success" : "danger"}>{doc.status}</Badge></td><td><Button variant="outline-primary" size="sm" onClick={() => handleDownloadFiscalDocument(doc.id)} disabled={doc.status !== "Disponible"}><FaDownload /></Button></td></tr>))}</tbody>
                  </Table>
                  <Button variant="secondary" size="sm" onClick={() => setLastSync(new Date().toLocaleString())}><FaSyncAlt className="me-1"/> Sincronizar ahora</Button>
                </Card.Body>
              </Card>
            </Col>
            <Col md={5}>
              <Card className="shadow-sm h-100">
                <Card.Header as="h5" className="bg-light text-dark d-flex align-items-center"><FaHandHoldingUsd className="me-2 text-success"/>Acceso a Financiamiento</Card.Header>
                <Card.Body>
                  <h6><FaPaperclip className="me-2"/>Generación de Paquetes para Solicitudes de Crédito</h6>
                  <Form.Group className="mb-3 mt-2"><Form.Label>Nombre de la Empresa</Form.Label><Form.Control type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} /></Form.Group>
                  <Button variant="primary" onClick={handleGenerateCreditPackage} disabled={generatingPackage || !companyName} className="w-100">{generatingPackage ? "Generando Paquete..." : <><FaChartLine className="me-1"/> Generar Paquete y Score</>}</Button>
                  {financialScore !== null && (<div className="mt-3"><h6>Score Financiero Interno:</h6><ProgressBar now={(financialScore / 950) * 100} label={`${financialScore}`} variant={financialScore > 800 ? "success" : financialScore > 700 ? "info" : "warning"} style={{height: "25px", fontSize: "1rem"}} /><p className="text-muted small mt-1">Score más alto mejora condiciones.</p></div>)}
                  {creditPackage && (<div className="mt-3"><h6>Documentos en Paquete:</h6><ListGroup variant="flush">{creditPackage.map(doc => (<ListGroup.Item key={doc.id} className="d-flex justify-content-between align-items-center">{doc.name}<Badge pill bg="light" text="dark">{doc.category}</Badge></ListGroup.Item>))}</ListGroup><Button variant="outline-success" size="sm" className="mt-2 w-100"><FaDownload className="me-1"/> Descargar Paquete</Button></div>)}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        <Tab eventKey="sectoralTaxes" title={<><FaCalculator className="me-2" /> Gestión de Impuestos Sectoriales</>}>
          <Row className="mt-3 justify-content-center">
            <Col md={8}>
              <Card className="shadow-sm">
                <Card.Header as="h5" className="bg-light text-dark d-flex align-items-center"><FaBriefcase className="me-2 text-info"/>Calculadora de Impuestos para Sector Turístico</Card.Header>
                <Card.Body>
                  <Form>
                    <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Ingresos Brutos (MXN)</Form.Label><Form.Control type="number" value={taxableIncome} onChange={(e) => setTaxableIncome(Number(e.target.value))} /></Form.Group></Col><Col md={6}><Form.Group className="mb-3"><Form.Label>Tipo de Servicio Turístico</Form.Label><Form.Select value={tourismServiceType} onChange={(e) => setTourismServiceType(e.target.value)}><option>Hospedaje</option><option>Transporte Turístico</option><option>Agencia de Viajes</option><option>Tour Operador Ecológico Certificado</option><option>Servicios Turísticos a Extranjeros (Exportación)</option></Form.Select></Form.Group></Col></Row>
                    <Button variant="info" onClick={handleCalculateSectoralTaxes} disabled={calculatingTaxes} className="w-100">{calculatingTaxes ? "Calculando..." : <><FaPercentage className="me-1"/> Calcular Impuestos Estimados</>}</Button>
                  </Form>
                  {calculatedTaxes && (<div className="mt-4"><h6>Resultados (Estimación):</h6><Table striped bordered responsive size="sm" className="mt-2"><thead className="table-light"><tr><th>Concepto</th><th>Monto (MXN)</th></tr></thead><tbody><tr><td>IVA</td><td>${calculatedTaxes.iva.toLocaleString("es-MX", {minimumFractionDigits:2})}</td></tr><tr><td>ISR</td><td>${calculatedTaxes.isr.toLocaleString("es-MX", {minimumFractionDigits:2})}</td></tr><tr><td>Contribuciones Locales</td><td>${calculatedTaxes.local.toLocaleString("es-MX", {minimumFractionDigits:2})}</td></tr><tr className="table-primary fw-bold"><td>Total Impuestos Estimados</td><td>${(calculatedTaxes.iva + calculatedTaxes.isr + calculatedTaxes.local).toLocaleString("es-MX", {minimumFractionDigits:2})}</td></tr></tbody></Table><h6>Exenciones Aplicadas:</h6><ListGroup variant="flush" className="mt-2">{calculatedTaxes.exemptions.map((ex, idx) => (<ListGroup.Item key={idx} style={{fontSize: "0.9em"}}>{ex}</ListGroup.Item>))}</ListGroup><Alert variant="secondary" className="mt-3" style={{fontSize: "0.85em"}}><strong>Nota:</strong> Cálculo simulado. Consulte a un profesional.</Alert></div>)}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>
      </Tabs>

      {/* Modal para Visualizar Factura (adaptado de FacturasLandingPage) */}
  
      <Modal show={showFacturaModal && facturaModalType === "VIEW"} onHide={closeFacturaModalHandler} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Factura {selectedInvoice?.serie}-{selectedInvoice?.folio}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedInvoice ? (
            <div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Fecha:</span>
                  <span>{new Date(selectedInvoice.fecha).toLocaleDateString()}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Estado:</span>
                  <span>{selectedInvoice.estado}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Cliente:</span>
                  <span>{selectedInvoice.receiver.name}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">RFC:</span>
                  <span>{selectedInvoice.receiver.rfc}</span>
                </div>
              </div>
              <div className="mb-3">
                <div className="fw-bold">Emisor</div>
                <div>{selectedInvoice.issuer.taxName} ({selectedInvoice.issuer.rfc})</div>
                <div>Régimen: {selectedInvoice.issuer.fiscalRegime}</div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Subtotal:</span>
                  <span>${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Descuento:</span>
                  <span>${selectedInvoice.discount.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between fw-bold">
                  <span>Total:</span>
                  <span>${selectedInvoice.total.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <div className="fw-bold mb-2">Conceptos</div>
                <ul className="list-unstyled mb-0">
                  {selectedInvoice.items.map((item, idx) => (
                    <li key={idx} className="mb-1 border-bottom pb-1">
                      <div className="d-flex justify-content-between">
                        <span>{item.description}</span>
                        <span>
                          {item.quantity} x ${item.unitValue.toFixed(2)}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between small text-muted">
                        <span>Unidad: {item.unit}</span>
                        <span>Desc: ${item.discount.toFixed(2)}</span>
                        <span>Total: ${item.total.toFixed(2)}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              {selectedInvoice.taxes && selectedInvoice.taxes.length > 0 && (
                <div className="mt-3">
                  <div className="fw-bold">Impuestos</div>
                  <ul className="list-unstyled mb-0">
                    {selectedInvoice.taxes.map((tax, idx) => (
                      <li key={idx}>
                        <span className="text-muted">{tax.name} ({tax.rate}%): </span>
                        <span>
                          ${tax.total.toFixed(2)} (
                          {tax.type === "transferred" ? "TRASLADADO" : tax.type.toUpperCase()}
                          )
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Botón para mostrar/ocultar extras */}
              <div className="mt-3">
                <button
                  className="btn btn-link p-0"
                  onClick={() => setShowFacturaExtras((v) => !v)}
                  style={{ fontSize: "0.95rem" }}
                >
                  {showFacturaExtras ? "Ocultar detalles extra ▲" : "Ver detalles extra ▼"}
                </button>
                {showFacturaExtras && (
                  <div className="mt-2">
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Método de Pago:</span>
                      <span>{selectedInvoice.paymentMethod}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Condiciones:</span>
                      <span>{selectedInvoice.paymentConditions}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Moneda:</span>
                      <span>{selectedInvoice.currency}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Lugar de Expedición:</span>
                      <span>{selectedInvoice.expeditionPlace}</span>
                    </div>
                    {selectedInvoice.taxStamp && (
                      <div className="mt-2">
                        <div className="fw-bold">Timbre Fiscal</div>
                        <div>UUID: {selectedInvoice.taxStamp.uuid}</div>
                        <div>Fecha: {new Date(selectedInvoice.taxStamp.date).toLocaleString()}</div>
                        <div>cfdiSign: {selectedInvoice.taxStamp.cfdiSign}</div>
                        <div>Certificado SAT: {selectedInvoice.taxStamp.satCertNumber}</div>
                        <div>satSign: {selectedInvoice.taxStamp.satSign}</div>
                        <div>RFC Prov. Certif.: {selectedInvoice.taxStamp.rfcProvCertif}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>No hay datos para mostrar.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeFacturaModalHandler}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Modal para "Nueva Factura" o "Editar Factura" */}
      {facturaModalType === "NEW" && (
          <FacturaModalInternal
            show={showFacturaModal}
            onClose={closeFacturaModalHandler}
            onSave={handleSaveFacturaFromModal}
             initialFactura={selectedInvoice || undefined} // selectedInvoice sería null para "NEW"
          />
      )}
      {/* No se implementa edición en esta demo para mantener la simplicidad, pero el modal podría recibir `selectedInvoice` */}


      <style type="text/css">{`.nav-tabs-professional .nav-link {color: #495057; border: 1px solid #dee2e6; border-bottom: none; margin-right: 2px; background-color: #f8f9fa;} .nav-tabs-professional .nav-link.active {color: #007bff; background-color: #ffffff; border-color: #dee2e6 #dee2e6 #ffffff; font-weight: bold;} .nav-tabs-professional .nav-link:hover {border-color: #e9ecef #e9ecef #dee2e6; background-color: #e9ecef;} .card-header {font-weight: 500;}`}</style>
    </Container>
  );
};

export default TaxAndFinancingIntegrationDashboardWithInvoicing;