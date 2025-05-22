import  { useState } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { createFactura } from "../functions/createFactura";
import type { Factura, Issuer, Receiver, Item, Tax, TaxStamp } from "../pages/fact";
import { v4 as uuidv4 } from "uuid"; // Instala con npm i uuid si no lo tienes

interface FacturaModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (factura: Factura) => void;
}

export const FacturaModal: React.FC<FacturaModalProps> = ({ show, onClose, onSave }) => {
  // Estados para cada sección del formulario
  const [serie, setSerie] = useState("");
  const [folio, setFolio] = useState("");
  const [fecha, setFecha] = useState("");
  const [expeditionPlace, setExpeditionPlace] = useState("");
  const [currency, setCurrency] = useState("MXN - Peso Mexicano");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [paymentConditions, setPaymentConditions] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [estado, setEstado] = useState("Activo");

  // Emisor
  const [issuer, setIssuer] = useState<Issuer>({
    rfc: "",
    taxName: "",
    fiscalRegime: ""
  });

  // Receptor
  const [receiver, setReceiver] = useState<Receiver>({
    rfc: "",
    name: ""
  });

  // Conceptos (items)
  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: 1, unit: "PZA", unitValue: 0, discount: 0, total: 0 }
  ]);

  // Impuestos
  const [taxes, setTaxes] = useState<Tax[]>([
    { name: "IVA", type: "transferred", rate: 16, total: 0 }
  ]);

  // Descuento global
  const [discount, setDiscount] = useState<number>(0);

  // TaxStamp (opcional)
  const [taxStamp, setTaxStamp] = useState<Partial<TaxStamp>>({});

  // Actualiza el total de cada item automáticamente
  const handleItemChange = (idx: number, field: keyof Item, value: any) => {
    const newItems = [...items];
    newItems[idx] = {
      ...newItems[idx],
      [field]: value,
    };
    // Calcula el total del item
    newItems[idx].total = (Number(newItems[idx].quantity) || 0) * (Number(newItems[idx].unitValue) || 0) - (Number(newItems[idx].discount) || 0);
    setItems(newItems);
  };

  // Agregar o quitar conceptos
  const addItem = () => setItems([...items, { description: "", quantity: 1, unit: "PZA", unitValue: 0, discount: 0, total: 0 }]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  // Actualiza el total de cada impuesto automáticamente
  const handleTaxChange = (idx: number, field: keyof Tax, value: any) => {
    const newTaxes = [...taxes];
    newTaxes[idx] = {
      ...newTaxes[idx],
      [field]: value,
    };
    setTaxes(newTaxes);
  };

  // Agregar o quitar impuestos
  const addTax = () => setTaxes([...taxes, { name: "", type: "transferred", rate: 0, total: 0 }]);
  const removeTax = (idx: number) => setTaxes(taxes.filter((_, i) => i !== idx));

  // Calcula automáticamente el IVA si hay un impuesto llamado "IVA"
  const autoCalculateIVATaxes = (items: Item[], taxes: Tax[]): Tax[] => {
    const ivaIdx = taxes.findIndex(t => t.name?.toUpperCase() === "IVA");
    if (ivaIdx !== -1) {
      const base = items.reduce((sum, item) => sum + (item.total || 0), 0);
      const rate = taxes[ivaIdx].rate || 16;
      taxes[ivaIdx].total = Number(((base - (Number(discount) || 0)) * (rate / 100)).toFixed(2));
    }
    return taxes;
  };

  // Guardar factura
  const handleSave = () => {
    // Generar valores automáticos para el timbre fiscal si no existen
    const generatedUuid = uuidv4();
    const now = new Date().toISOString();

    // Calcula impuestos automáticos (IVA)
    const taxesWithIVA = autoCalculateIVATaxes(items, taxes);

    const factura = createFactura({
      serie,
      folio,
      fecha,
      paymentTerms,
      paymentConditions,
      paymentMethod,
      expeditionPlace,
      currency,
      estado,
      issuer,
      receiver,
      items,
      taxes: taxesWithIVA,
      discount,
      taxStamp: {
        uuid: taxStamp.uuid || generatedUuid,
        date: taxStamp.date || now,
        cfdiSign: taxStamp.cfdiSign || "FAKE-CFDI-SIGN-" + generatedUuid.slice(0, 8),
        satCertNumber: taxStamp.satCertNumber || "3000100000030002" + Math.floor(Math.random() * 100000),
        satSign: taxStamp.satSign || "FAKE-SAT-SIGN-" + generatedUuid.slice(0, 8),
        rfcProvCertif: taxStamp.rfcProvCertif || "TURPROVCERT" + Math.floor(Math.random() * 1000)
      }
    });
    onSave(factura);
    onClose();
    // Limpia el formulario si lo deseas aquí
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Nueva Factura</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          {/* Datos generales */}
          <Row>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label>Serie</Form.Label>
                <Form.Control value={serie} onChange={e => setSerie(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group className="mb-2">
                <Form.Label>Folio</Form.Label>
                <Form.Control value={folio} onChange={e => setFolio(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Fecha</Form.Label>
                <Form.Control type="datetime-local" value={fecha} onChange={e => setFecha(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Lugar de Expedición</Form.Label>
                <Form.Control value={expeditionPlace} onChange={e => setExpeditionPlace(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Moneda</Form.Label>
                <Form.Control value={currency} onChange={e => setCurrency(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Estado</Form.Label>
                <Form.Control value={estado} onChange={e => setEstado(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Método de Pago</Form.Label>
                <Form.Control value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Condiciones</Form.Label>
                <Form.Control value={paymentConditions} onChange={e => setPaymentConditions(e.target.value)} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Forma de Pago</Form.Label>
                <Form.Control value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} />
              </Form.Group>
            </Col>
          </Row>
          {/* Emisor */}
          <hr />
          <h6>Datos del Emisor</h6>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>RFC</Form.Label>
                <Form.Control value={issuer.rfc} onChange={e => setIssuer({ ...issuer, rfc: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Razón Social</Form.Label>
                <Form.Control value={issuer.taxName} onChange={e => setIssuer({ ...issuer, taxName: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-2">
                <Form.Label>Régimen Fiscal</Form.Label>
                <Form.Control value={issuer.fiscalRegime} onChange={e => setIssuer({ ...issuer, fiscalRegime: e.target.value })} />
              </Form.Group>
            </Col>
          </Row>
          {/* Receptor */}
          <hr />
          <h6>Datos del Receptor</h6>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>RFC</Form.Label>
                <Form.Control value={receiver.rfc} onChange={e => setReceiver({ ...receiver, rfc: e.target.value })} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-2">
                <Form.Label>Nombre</Form.Label>
                <Form.Control value={receiver.name} onChange={e => setReceiver({ ...receiver, name: e.target.value })} />
              </Form.Group>
            </Col>
          </Row>
          {/* Conceptos */}
          <hr />
          <h6>Conceptos</h6>
          {items.map((item, idx) => (
            <Row key={idx} className="align-items-end">
              <Col md={3}>
                <Form.Group className="mb-2">
                  <Form.Label>Descripción</Form.Label>
                  <Form.Control value={item.description} onChange={e => handleItemChange(idx, "description", e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-2">
                  <Form.Label>Cantidad</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    autoComplete="off"
                    onWheel={e => e.currentTarget.blur()}
                    value={item.quantity}
                    onChange={e => handleItemChange(idx, "quantity", Number(e.target.value.replace(/[^0-9.]/g, "")))}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-2">
                  <Form.Label>Unidad</Form.Label>
                  <Form.Control value={item.unit} onChange={e => handleItemChange(idx, "unit", e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-2">
                  <Form.Label>Precio Unitario</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    autoComplete="off"
                    onWheel={e => e.currentTarget.blur()}
                    value={item.unitValue}
                    onChange={e => handleItemChange(idx, "unitValue", Number(e.target.value.replace(/[^0-9.]/g, "")))}
                  />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-2">
                  <Form.Label>Descuento</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    autoComplete="off"
                    onWheel={e => e.currentTarget.blur()}
                    value={item.discount}
                    onChange={e => handleItemChange(idx, "discount", Number(e.target.value.replace(/[^0-9.]/g, "")))}
                  />
                </Form.Group>
              </Col>
              <Col md={12}>
                <Button variant="danger" size="sm" onClick={() => removeItem(idx)} disabled={items.length === 1}>
                  Quitar
                </Button>
              </Col>
            </Row>
          ))}
          <Button variant="secondary" size="sm" className="mb-3" onClick={addItem}>
            Agregar concepto
          </Button>
          {/* Impuestos */}
          <hr />
          <h6>Impuestos</h6>
          {taxes.map((tax, idx) => (
            <Row key={idx} className="align-items-end">
              <Col md={3}>
                <Form.Group className="mb-2">
                  <Form.Label>Nombre</Form.Label>
                  <Form.Control value={tax.name} onChange={e => handleTaxChange(idx, "name", e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-2">
                  <Form.Label>Tipo</Form.Label>
                  <Form.Control value={tax.type} onChange={e => handleTaxChange(idx, "type", e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-2">
                  <Form.Label>Tasa (%)</Form.Label>
                  <Form.Control
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9.]*"
                    autoComplete="off"
                    onWheel={e => e.currentTarget.blur()}
                    value={tax.rate}
                    onChange={e => handleTaxChange(idx, "rate", Number(e.target.value.replace(/[^0-9.]/g, "")))}
                  />
                </Form.Group>
              </Col>
              <Col md={1}>
                <Button variant="danger" size="sm" onClick={() => removeTax(idx)} disabled={taxes.length === 1}>
                  Quitar
                </Button>
              </Col>
            </Row>
          ))}
          <Button variant="secondary" size="sm" className="mb-3" onClick={addTax}>
            Agregar impuesto
          </Button>
          {/* Descuento global */}
          <hr />
          <Form.Group className="mb-2">
            <Form.Label>Descuento global</Form.Label>
            <Form.Control
              type="text"
              inputMode="decimal"
              pattern="[0-9.]*"
              autoComplete="off"
              onWheel={e => e.currentTarget.blur()}
              value={discount}
              onChange={e => setDiscount(Number(e.target.value.replace(/[^0-9.]/g, "")))}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="success" onClick={handleSave}>
          Guardar factura
        </Button>
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default FacturaModal;