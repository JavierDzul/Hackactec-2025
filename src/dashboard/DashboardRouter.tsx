import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Contabilidad } from "./pages/Contabilidad";
import FinancialProjectionDashboardToursFinal from "./pages/Proyecciones";
import FinancialProjectionDashboardRechartsPlus from "./pages/ProyeccionesDificil";
import EnhancedCashFlowDashboard from "./pages/flujo";


export const DashboardRoutes = () => {

    return (
    
      <DashboardLayout> 
        <Routes>
 
        <Route path="/contabilidad" element={<Contabilidad />} />
        <Route path="/Proyecciones" element={<FinancialProjectionDashboardToursFinal />} />
        <Route path="/ProyeccionesC" element={<FinancialProjectionDashboardRechartsPlus />} />
        <Route path="/Flujo" element={<EnhancedCashFlowDashboard />} />

        </Routes>
      </DashboardLayout>
    );
  };