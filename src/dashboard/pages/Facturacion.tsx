import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button, Table, Form } from "react-bootstrap";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface TaxStamp {
  uuid: string;
  date: string;
  satCertNumber: string;
  satSign: string;
  cfdiSign: string;
  rfcProvCertif: string;
}

interface Issuer {
  fiscalRegime: string;
  rfc: string;
  taxName: string;
}

interface Receiver {
  rfc: string;
  name: string;
}

interface Item {
  discount: number;
  quantity: number;
  unit: string;
  description: string;
  unitValue: number;
  total: number;
}

interface Tax {
  total: number;
  name: string;
  rate: number;
  type: string;
}

interface Factura {
  uuid: string;
  serie: string;
  folio: string;
  fecha: string;
  paymentTerms: string;
  paymentConditions: string;
  paymentMethod: string;
  expeditionPlace: string;
  currency: string;
  subtotal: number;
  discount: number;
  total: number;
  estado: string;
  issuer: Issuer;
  receiver: Receiver;
  items: Item[];
  taxes: Tax[];
  taxStamp: TaxStamp;
}

export default function FacturasLandingPage() {
  const [invoices, setInvoices] = useState<Factura[]>([]);
  const [search, setSearch] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(2);
  const [selectedInvoice, setSelectedInvoice] = useState<Factura | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalType, setModalType] = useState<"PDF" | "XML" | "VIEW" | "NEW" | "">("");
  const [pdfFactura, setPdfFactura] = useState<Factura | null>(null);
  const [showExtras, setShowExtras] = useState<boolean>(false);

  // Estado para el formulario de nueva factura
  const [newFactura, setNewFactura] = useState<Partial<Factura>>({
    serie: "",
    folio: "",
    fecha: "",
    paymentTerms: "",
    paymentConditions: "",
    paymentMethod: "",
    expeditionPlace: "",
    currency: "",
    subtotal: 0,
    discount: 0,
    total: 0,
    estado: "Activo",
    issuer: { fiscalRegime: "", rfc: "", taxName: "" },
    receiver: { rfc: "", name: "" },
    items: [],
    taxes: [],
    taxStamp: {
      uuid: "",
      date: "",
      cfdiSign: "",
      satCertNumber: "",
      satSign: "",
      rfcProvCertif: ""
    }
  });

  // Cargar facturas desde localStorage o mock, pero siempre asegurando que el ejemplo esté presente
  useEffect(() => {
    const exampleFacturas: Factura[] = [
      {
        uuid: "A1B2C3D4-E5F6-7890-1234-56789ABCDEF0",
        serie: "T",
        folio: "101",
        fecha: "2025-06-01T09:00:00",
        paymentTerms: "01 - Efectivo",
        paymentConditions: "ANTICIPO DEL 50%",
        paymentMethod: "PUE - Pago en una sola exhibición",
        expeditionPlace: "64000",
        currency: "MXN - Peso Mexicano",
        subtotal: 8000.0,
        discount: 500.0,
        total: 8700.0,
        estado: "Activo",
        issuer: {
          fiscalRegime: "601 - General de Ley Personas Morales",
          rfc: "TUR123456789",
          taxName: "TOUR OPERADORA MEXICANA SA DE CV"
        },
        receiver: {
          rfc: "CLI987654321",
          name: "JUAN PÉREZ"
        },
        items: [
          {
            discount: 0.0,
            quantity: 4,
            unit: "PZA",
            description: "Tour a Teotihuacán (adulto)",
            unitValue: 2000.0,
            total: 8000.0
          }
        ],
        taxes: [
          {
            total: 1200.0,
            name: "IVA",
            rate: 16.0,
            type: "transferred"
          }
        ],
        taxStamp: {
          uuid: "A1B2C3D4-E5F6-7890-1234-56789ABCDEF0",
          date: "2025-06-01T09:05:00",
          cfdiSign: "FAKE-CFDI-SIGN-TOUR",
          satCertNumber: "30001000000300023789",
          satSign: "FAKE-SAT-SIGN-TOUR",
          rfcProvCertif: "TURPROVCERT123"
        }
      },
      {
        uuid: "B2C3D4E5-F6A1-2345-6789-0ABCDEF12345",
        serie: "T",
        folio: "102",
        fecha: "2025-06-10T08:30:00",
        paymentTerms: "02 - Cheque nominativo",
        paymentConditions: "PAGO AL CONTADO",
        paymentMethod: "PUE - Pago en una sola exhibición",
        expeditionPlace: "64000",
        currency: "MXN - Peso Mexicano",
        subtotal: 6000.0,
        discount: 0.0,
        total: 6960.0,
        estado: "Activo",
        issuer: {
          fiscalRegime: "601 - General de Ley Personas Morales",
          rfc: "TUR123456789",
          taxName: "TOUR OPERADORA MEXICANA SA DE CV"
        },
        receiver: {
          rfc: "CLI123456789",
          name: "MARÍA GARCÍA"
        },
        items: [
          {
            discount: 0.0,
            quantity: 3,
            unit: "PZA",
            description: "Tour a Xochimilco (adulto)",
            unitValue: 2000.0,
            total: 6000.0
          }
        ],
        taxes: [
          {
            total: 960.0,
            name: "IVA",
            rate: 16.0,
            type: "transferred"
          }
        ],
        taxStamp: {
          uuid: "B2C3D4E5-F6A1-2345-6789-0ABCDEF12345",
          date: "2025-06-10T08:35:00",
          cfdiSign: "FAKE-CFDI-SIGN-XOCHI",
          satCertNumber: "30001000000300023790",
          satSign: "FAKE-SAT-SIGN-XOCHI",
          rfcProvCertif: "TURPROVCERT124"
        }
      },
      {
        uuid: "C3D4E5F6-A1B2-3456-7890-1BCDEF234567",
        serie: "T",
        folio: "103",
        fecha: "2025-06-15T11:00:00",
        paymentTerms: "03 - Transferencia electrónica de fondos",
        paymentConditions: "PAGO EN PARCIALIDADES",
        paymentMethod: "PPD - Pago en parcialidades o diferido",
        expeditionPlace: "64000",
        currency: "MXN - Peso Mexicano",
        subtotal: 9000.0,
        discount: 1000.0,
        total: 9280.0,
        estado: "Activo",
        issuer: {
          fiscalRegime: "601 - General de Ley Personas Morales",
          rfc: "TUR123456789",
          taxName: "TOUR OPERADORA MEXICANA SA DE CV"
        },
        receiver: {
          rfc: "CLI555555555",
          name: "CARLOS LÓPEZ"
        },
        items: [
          {
            discount: 0.0,
            quantity: 2,
            unit: "PZA",
            description: "Tour a Chichen Itzá (adulto)",
            unitValue: 4500.0,
            total: 9000.0
          }
        ],
        taxes: [
          {
            total: 1280.0,
            name: "IVA",
            rate: 16.0,
            type: "transferred"
          }
        ],
        taxStamp: {
          uuid: "C3D4E5F6-A1B2-3456-7890-1BCDEF234567",
          date: "2025-06-15T11:05:00",
          cfdiSign: "FAKE-CFDI-SIGN-CHICHEN",
          satCertNumber: "30001000000300023791",
          satSign: "FAKE-SAT-SIGN-CHICHEN",
          rfcProvCertif: "TURPROVCERT125"
        }
      }
    ];

    const stored = localStorage.getItem("facturas");
    let facturas: Factura[] = [];
    if (stored) {
      try {
        facturas = JSON.parse(stored);
      } catch {
        facturas = [];
      }
    }
    // Asegura que todos los ejemplos estén presentes (no duplicados)
    exampleFacturas.forEach(example => {
      if (!facturas.some(f => f.uuid === example.uuid)) {
        facturas.push(example);
      }
    });
    localStorage.setItem("facturas", JSON.stringify(facturas));
    setInvoices(facturas);
  }, []);

  // Guardar en localStorage cuando cambian las facturas
  useEffect(() => {
    localStorage.setItem("facturas", JSON.stringify(invoices));
  }, [invoices]);

  const filtered = invoices.filter((inv) =>
    inv.receiver.name.toLowerCase().includes(search.toLowerCase()) ||
    inv.receiver.rfc.toLowerCase().includes(search.toLowerCase()) ||
    inv.folio.toLowerCase().includes(search.toLowerCase())
  );

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentInvoices = filtered.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const openModal = (invoice: Factura, type: "PDF" | "XML" | "VIEW") => {
    setSelectedInvoice(invoice);
    setModalType(type);
    setShowModal(true);
    if (type === "PDF") setPdfFactura(invoice);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInvoice(null);
    setModalType("");
    setPdfFactura(null);
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

  const handleDownloadXML = (factura: Factura) => {
    // Ejemplo simple de XML, puedes personalizarlo según tu estructura real
    const xml = `
<Factura>
  <Serie>${factura.serie}</Serie>
  <Folio>${factura.folio}</Folio>
  <Fecha>${factura.fecha}</Fecha>
  <Cliente>
    <Nombre>${factura.receiver.name}</Nombre>
    <RFC>${factura.receiver.rfc}</RFC>
  </Cliente>
  <Emisor>
    <Nombre>${factura.issuer.taxName}</Nombre>
    <RFC>${factura.issuer.rfc}</RFC>
    <Regimen>${factura.issuer.fiscalRegime}</Regimen>
  </Emisor>
  <Total>${factura.total.toFixed(2)}</Total>
  <Moneda>${factura.currency}</Moneda>
  <Items>
    ${factura.items.map(item => `
      <Item>
        <Descripcion>${item.description}</Descripcion>
        <Cantidad>${item.quantity}</Cantidad>
        <Unidad>${item.unit}</Unidad>
        <Unitario>${item.unitValue.toFixed(2)}</Unitario>
        <Descuento>${item.discount.toFixed(2)}</Descuento>
        <Total>${item.total.toFixed(2)}</Total>
      </Item>
    `).join("")}
  </Items>
</Factura>
  `.trim();

    const blob = new Blob([xml], { type: "application/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Factura_${factura.serie}-${factura.folio}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadXLSX = (factura: Factura) => {
    // Estructura simple: una hoja con los datos generales y otra con los conceptos
    const general = [
      ["Serie", factura.serie],
      ["Folio", factura.folio],
      ["Fecha", factura.fecha],
      ["Cliente", factura.receiver.name],
      ["RFC Cliente", factura.receiver.rfc],
      ["Emisor", factura.issuer.taxName],
      ["RFC Emisor", factura.issuer.rfc],
      ["Régimen Fiscal", factura.issuer.fiscalRegime],
      ["Subtotal", factura.subtotal],
      ["Descuento", factura.discount],
      ["Total", factura.total],
      ["Estado", factura.estado],
      ["Método de Pago", factura.paymentMethod],
      ["Condiciones", factura.paymentConditions],
      ["Moneda", factura.currency],
      ["Lugar de Expedición", factura.expeditionPlace]
    ];

    const conceptos = factura.items.map(item => ({
      Descripción: item.description,
      Cantidad: item.quantity,
      Unidad: item.unit,
      Unitario: item.unitValue,
      Descuento: item.discount,
      Total: item.total
    }));

    const wb = XLSX.utils.book_new();
    const wsGeneral = XLSX.utils.aoa_to_sheet(general);
    XLSX.utils.book_append_sheet(wb, wsGeneral, "Datos Generales");
    const wsConceptos = XLSX.utils.json_to_sheet(conceptos);
    XLSX.utils.book_append_sheet(wb, wsConceptos, "Conceptos");

    XLSX.writeFile(wb, `Factura_${factura.serie}-${factura.folio}.xlsx`);
  };

  const handleDownloadCSV = (factura: Factura) => {
    // Solo los conceptos en CSV
    const conceptos = factura.items.map(item => ({
      Descripción: item.description,
      Cantidad: item.quantity,
      Unidad: item.unit,
      Unitario: item.unitValue,
      Descuento: item.discount,
      Total: item.total
    }));

    const ws = XLSX.utils.json_to_sheet(conceptos);
    const csv = XLSX.utils.sheet_to_csv(ws);

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Factura_${factura.serie}-${factura.folio}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Nueva factura: abrir modal
  const openNewFacturaModal = () => {
    setNewFactura({
      serie: "",
      folio: "",
      fecha: "",
      paymentTerms: "",
      paymentConditions: "",
      paymentMethod: "",
      expeditionPlace: "",
      currency: "",
      subtotal: 0,
      discount: 0,
      total: 0,
      estado: "Activo",
      issuer: { fiscalRegime: "", rfc: "", taxName: "" },
      receiver: { rfc: "", name: "" },
      items: [],
      taxes: [],
      taxStamp: {
        uuid: "",
        date: "",
        cfdiSign: "",
        satCertNumber: "",
        satSign: "",
        rfcProvCertif: ""
      }
    });
    setModalType("NEW");
    setShowModal(true);
  };

  // Guardar nueva factura
  const handleSaveNewFactura = () => {
    if (!newFactura.serie || !newFactura.folio || !newFactura.fecha || !newFactura.receiver?.name) {
      alert("Completa los campos obligatorios");
      return;
    }
    const uuid = crypto.randomUUID();
    const factura: Factura = {
      ...newFactura,
      uuid,
      items: newFactura.items && newFactura.items.length > 0 ? newFactura.items : [
        {
          discount: 0,
          quantity: 1,
          unit: "PZA",
          description: "Tour turístico",
          unitValue: 1000,
          total: 1000
        }
      ],
      taxes: newFactura.taxes && newFactura.taxes.length > 0 ? newFactura.taxes : [
        {
          total: 160,
          name: "IVA",
          rate: 16,
          type: "transferred"
        }
      ],
      taxStamp: {
        uuid,
        date: new Date().toISOString(),
        cfdiSign: "",
        satCertNumber: "",
        satSign: "",
        rfcProvCertif: ""
      }
    } as Factura;
    setInvoices([factura, ...invoices]);
    setShowModal(false);
    setModalType("");
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3">📄 Facturación</h1>
        <div>
          <button
            className="btn btn-primary me-2"
            onClick={openNewFacturaModal}
          >
            Nueva Factura
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <input
            type="text"
            className="form-control mb-4"
            placeholder="Buscar por cliente, RFC o folio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <table className="table table-striped">
            <thead>
              <tr>
                <th>Folio</th>
                <th>Serie</th>
                <th>Cliente</th>
                <th>RFC</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentInvoices.map((factura) => (
                <tr key={factura.uuid}>
                  <td>{factura.folio}</td>
                  <td>{factura.serie}</td>
                  <td>{factura.receiver.name}</td>
                  <td>{factura.receiver.rfc}</td>
                  <td>{new Date(factura.fecha).toLocaleDateString()}</td>
                  <td>${factura.total.toFixed(2)}</td>
                  <td>{factura.estado}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-info me-2"
                      onClick={() => openModal(factura, "VIEW")}
                    >
                      Ver
                    </button>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => openModal(factura, "PDF")}
                    >
                      PDF
                    </button>
                    <button
                      className="btn btn-sm btn-outline-success me-2"
                      onClick={() => handleDownloadXML(factura)}
                    >
                      XML
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning me-2"
                      onClick={() => handleDownloadXLSX(factura)}
                    >
                      XLSX
                    </button>
                    <button
                      className="btn btn-sm btn-outline-dark"
                      onClick={() => handleDownloadCSV(factura)}
                    >
                      CSV
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-center">
            <nav>
              <ul className="pagination">
                {[...Array(totalPages)].map((_, i) => (
                  <li
                    key={i}
                    className={`page-item ${currentPage === i + 1 ? "active" : ""}`}
                  >
                    <button className="page-link" onClick={() => setCurrentPage(i + 1)}>
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </div>

      {/* Modal Vista */}
      <Modal show={showModal && modalType === "VIEW"} onHide={closeModal} centered>
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
                  onClick={() => setShowExtras((v) => !v)}
                  style={{ fontSize: "0.95rem" }}
                >
                  {showExtras ? "Ocultar detalles extra ▲" : "Ver detalles extra ▼"}
                </button>
                {showExtras && (
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
          <Button variant="secondary" onClick={closeModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal PDF */}
      <Modal show={showModal && modalType === "PDF"} onHide={closeModal} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>
            Vista PDF - Factura {pdfFactura?.serie}-{pdfFactura?.folio}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {pdfFactura ? (
            <div className="p-3" style={{ background: "#f8f9fa", borderRadius: "8px" }}>
              <div className="mb-2 text-center fw-bold fs-5">
                Factura {pdfFactura.serie}-{pdfFactura.folio}
              </div>
              <div className="mb-3 d-flex justify-content-between">
                <span>Fecha:</span>
                <span>{new Date(pdfFactura.fecha).toLocaleDateString()}</span>
              </div>
              <div className="mb-3 d-flex justify-content-between">
                <span>Estado:</span>
                <span>{pdfFactura.estado}</span>
              </div>
              <div className="mb-3 d-flex justify-content-between">
                <span>Cliente:</span>
                <span>{pdfFactura.receiver.name}</span>
              </div>
              <div className="mb-3 d-flex justify-content-between">
                <span>RFC:</span>
                <span>{pdfFactura.receiver.rfc}</span>
              </div>
              <div className="mb-3 d-flex justify-content-between">
                <span>Método de Pago:</span>
                <span>{pdfFactura.paymentMethod}</span>
              </div>
              <div className="mb-3 d-flex justify-content-between">
                <span>Condiciones:</span>
                <span>{pdfFactura.paymentConditions}</span>
              </div>
              <div className="mb-3 d-flex justify-content-between">
                <span>Moneda:</span>
                <span>{pdfFactura.currency}</span>
              </div>
              <div className="mb-3 d-flex justify-content-between">
                <span>Lugar de Expedición:</span>
                <span>{pdfFactura.expeditionPlace}</span>
              </div>
              <div className="mb-3">
                <div className="fw-bold">Emisor</div>
                <div>{pdfFactura.issuer.taxName} ({pdfFactura.issuer.rfc})</div>
                <div>Régimen: {pdfFactura.issuer.fiscalRegime}</div>
              </div>
              <hr />
              <div className="mb-2 fw-bold">Conceptos</div>
              <Table size="sm" bordered>
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Cantidad</th>
                    <th>Unidad</th>
                    <th>Unitario</th>
                    <th>Desc.</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pdfFactura.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unit}</td>
                      <td>${item.unitValue.toFixed(2)}</td>
                      <td>${item.discount.toFixed(2)}</td>
                      <td>${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex justify-content-end mt-3">
                <div>
                  <div>Subtotal: <b>${pdfFactura.subtotal.toFixed(2)}</b></div>
                  <div>Descuento: <b>${pdfFactura.discount.toFixed(2)}</b></div>
                  <div>Total: <b>${pdfFactura.total.toFixed(2)}</b></div>
                </div>
              </div>
              {pdfFactura.taxes && pdfFactura.taxes.length > 0 && (
                <div className="mt-3">
                  <div className="fw-bold">Impuestos</div>
                  <ul className="list-unstyled mb-0">
                    {pdfFactura.taxes.map((tax, idx) => (
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
              {pdfFactura.taxStamp && (
                <div className="mt-3">
                  <div className="fw-bold">Timbre Fiscal</div>
                  <div>UUID: {pdfFactura.taxStamp.uuid}</div>
                  <div>Fecha: {new Date(pdfFactura.taxStamp.date).toLocaleString()}</div>
                  <div>cfdiSign: {pdfFactura.taxStamp.cfdiSign}</div>
                  <div>Certificado SAT: {pdfFactura.taxStamp.satCertNumber}</div>
                  <div>satSign: {pdfFactura.taxStamp.satSign}</div>
                  <div>RFC Prov. Certif.: {pdfFactura.taxStamp.rfcProvCertif}</div>
                </div>
              )}
            </div>
          ) : (
            <div>No hay datos para mostrar.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => {
              if (pdfFactura) exportFacturaToPDF(pdfFactura);
            }}
          >
            Descargar PDF
          </Button>
          <Button variant="secondary" onClick={closeModal}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal Nueva Factura */}
      <Modal show={showModal && modalType === "NEW"} onHide={closeModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>Nueva Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-2">
              <Form.Label>Serie</Form.Label>
              <Form.Control
                value={newFactura.serie || ""}
                onChange={e => setNewFactura({ ...newFactura, serie: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Folio</Form.Label>
              <Form.Control
                value={newFactura.folio || ""}
                onChange={e => setNewFactura({ ...newFactura, folio: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                value={newFactura.fecha ? newFactura.fecha.substring(0, 10) : ""}
                onChange={e => setNewFactura({ ...newFactura, fecha: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Cliente</Form.Label>
              <Form.Control
                value={newFactura.receiver?.name || ""}
                onChange={e => setNewFactura({
                  ...newFactura,
                  receiver: { ...newFactura.receiver!, name: e.target.value }
                })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>RFC Cliente</Form.Label>
              <Form.Control
                value={newFactura.receiver?.rfc || ""}
                onChange={e => setNewFactura({
                  ...newFactura,
                  receiver: { ...newFactura.receiver!, rfc: e.target.value }
                })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Subtotal</Form.Label>
              <Form.Control
                type="number"
                value={newFactura.subtotal || 0}
                onChange={e => setNewFactura({ ...newFactura, subtotal: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Descuento</Form.Label>
              <Form.Control
                type="number"
                value={newFactura.discount || 0}
                onChange={e => setNewFactura({ ...newFactura, discount: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Total</Form.Label>
              <Form.Control
                type="number"
                value={newFactura.total || 0}
                onChange={e => setNewFactura({ ...newFactura, total: Number(e.target.value) })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Moneda</Form.Label>
              <Form.Control
                value={newFactura.currency || ""}
                onChange={e => setNewFactura({ ...newFactura, currency: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Método de Pago</Form.Label>
              <Form.Control
                value={newFactura.paymentMethod || ""}
                onChange={e => setNewFactura({ ...newFactura, paymentMethod: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Condiciones</Form.Label>
              <Form.Control
                value={newFactura.paymentConditions || ""}
                onChange={e => setNewFactura({ ...newFactura, paymentConditions: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Lugar de Expedición</Form.Label>
              <Form.Control
                value={newFactura.expeditionPlace || ""}
                onChange={e => setNewFactura({ ...newFactura, expeditionPlace: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Emisor</Form.Label>
              <Form.Control
                value={newFactura.issuer?.taxName || ""}
                onChange={e => setNewFactura({
                  ...newFactura,
                  issuer: { ...newFactura.issuer!, taxName: e.target.value }
                })}
                placeholder="Nombre o razón social"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>RFC Emisor</Form.Label>
              <Form.Control
                value={newFactura.issuer?.rfc || ""}
                onChange={e => setNewFactura({
                  ...newFactura,
                  issuer: { ...newFactura.issuer!, rfc: e.target.value }
                })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Régimen Fiscal Emisor</Form.Label>
              <Form.Control
                value={newFactura.issuer?.fiscalRegime || ""}
                onChange={e => setNewFactura({
                  ...newFactura,
                  issuer: { ...newFactura.issuer!, fiscalRegime: e.target.value }
                })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleSaveNewFactura}>
            Guardar
          </Button>
          <Button variant="secondary" onClick={closeModal}>
            Cancelar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
