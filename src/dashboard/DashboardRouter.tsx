import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Contabilidad } from "./pages/Contabilidad";
import Facturacion from "./pages/Facturacion";


export const DashboardRoutes = () => {

    return (
    
      <DashboardLayout> 
        <Routes>
 
        <Route path="/contabilidad" element={<Contabilidad />} />
        <Route path="/facturacion" element={<Facturacion />} />
       
        </Routes>
      </DashboardLayout>
    );
  };