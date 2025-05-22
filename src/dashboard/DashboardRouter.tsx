import { Routes, Route, Navigate } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { Contabilidad } from "./pages/Contabilidad";
import { InventarioPage, type Producto } from "./pages/Inventario";
import { VentasPage } from "./pages/Ventas";
import { VentaDetallePage } from "./pages/DetalleVenta";import Facturacion from "./pages/Facturacion";


export const DashboardRoutes = () => {


    return (
    
      <DashboardLayout> 
        <Routes>
 
        <Route path="/contabilidad" element={<Contabilidad />} />
        <Route path="/inventario" element={<InventarioPage/>}/>
        <Route path="/ventas" element={<VentasPage/>}/>
        <Route path="/detalle-venta" element={<VentaDetallePage/>}/>
        <Route path="/facturacion" element={<Facturacion />} />
       
        </Routes>
      </DashboardLayout>
    );
  };