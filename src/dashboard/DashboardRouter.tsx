import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import FinancialProjectionDashboardToursFinal from "./pages/Proyecciones";
import FinancialProjectionDashboardRechartsPlus from "./pages/ProyeccionesDificil";
import EnhancedCashFlowDashboard from "./pages/flujo";
import { InventarioPage, type Producto } from "./pages/Inventario";
import { VentasPage } from "./pages/Ventas";
import { VentaDetallePage } from "./pages/DetalleVenta";import Facturacion from "./pages/Facturacion";
import { HistorialSalidasPage } from "./pages/HistorialSalidas";
import TaxAndFinancingIntegrationDashboard from "./pages/fact";
import ClienteComponenteDemo from "./pages/cliente";
import ContabilidadDashboard from "./pages/Contabilidad";


export const DashboardRoutes = () => {


    return (
    
      <DashboardLayout> 
        <Routes>
 
        <Route path="/contabilidad" element={<ContabilidadDashboard />} />
        <Route path="/Proyecciones" element={<FinancialProjectionDashboardToursFinal />} />
        <Route path="/ProyeccionesC" element={<FinancialProjectionDashboardRechartsPlus />} />
        <Route path="/Flujo" element={<EnhancedCashFlowDashboard />} />
        <Route path="/inventario" element={<InventarioPage/>}/>
        <Route path="/ventas" element={<VentasPage/>}/>
        <Route path="/detalle-venta" element={<VentaDetallePage/>}/>
        <Route path="/facturacion" element={<Facturacion />} />
        <Route path="/historial-salidas" element={<HistorialSalidasPage />} />
       
        </Routes>
      </DashboardLayout>
    );
  };