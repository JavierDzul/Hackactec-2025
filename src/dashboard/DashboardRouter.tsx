import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Contabilidad } from "./pages/Contabilidad";
import FinancialProjectionDashboardToursFinal from "./pages/Proyecciones";
import FinancialProjectionDashboardRechartsPlus from "./pages/ProyeccionesDificil";
import EnhancedCashFlowDashboard from "./pages/flujo";
import { InventarioPage, type Producto } from "./pages/Inventario";
import { VentasPage } from "./pages/Ventas";
import { VentaDetallePage } from "./pages/DetalleVenta";
import { HistorialSalidasPage } from "./pages/HistorialSalidas";
import TaxAndFinancingIntegrationDashboard from "./pages/fact";
import { ServiciosPage } from "./pages/Servicios";
import ClienteComponenteDemo from "./pages/cliente";
import OptimizacionRecursosMIPYMEDashboard from "./pages/optimizacion";


export const DashboardRoutes = () => {


    return (
    
      <DashboardLayout> 
        <Routes>
 
        <Route path="/contabilidad" element={<Contabilidad />} />
        <Route path="/Proyecciones" element={<FinancialProjectionDashboardToursFinal />} />
        <Route path="/ProyeccionesC" element={<FinancialProjectionDashboardRechartsPlus />} />
        <Route path="/Flujo" element={<EnhancedCashFlowDashboard />} />
        <Route path="/facturacion" element={<TaxAndFinancingIntegrationDashboard />} />
        <Route path="/clientes" element={ <ClienteComponenteDemo></ClienteComponenteDemo>} />
        <Route path="/inventario" element={<InventarioPage/>}/>
        <Route path="/ventas" element={<VentasPage/>}/>
        <Route path="/detalle-venta" element={<VentaDetallePage/>}/>
        <Route path="/historial-salidas" element={<HistorialSalidasPage />} />
        <Route path="/servicios" element={<ServiciosPage />} />
       
        <Route path="/optimizacion" element={<OptimizacionRecursosMIPYMEDashboard />} />

        </Routes>
      </DashboardLayout>
    );
  };