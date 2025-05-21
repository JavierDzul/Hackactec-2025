import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Contabilidad } from "./pages/Contabilidad";


export const DashboardRoutes = () => {

    return (
    
      <DashboardLayout> 
        <Routes>
 
        <Route path="/contabilidad" element={<Contabilidad />} />
       
        </Routes>
      </DashboardLayout>
    );
  };