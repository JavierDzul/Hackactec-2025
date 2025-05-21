import { useEffect, useState } from 'react';

import { Navigate, Route, RouterProvider, Routes, useNavigate } from 'react-router-dom';
import { DashboardRoutes } from '../dashboard/DashboardRouter';
export const AppRouter = () => {

  const [loading, setLoading] = useState(true);



  return (
  
  
        <Routes>
            <Route path='/*' element={<DashboardRoutes />} />
          
        </Routes>
    
 
  );
};