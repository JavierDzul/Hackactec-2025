import { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaUserCircle, FaShoppingCart, FaBrain } from "react-icons/fa";
import type { Producto } from './pages/Inventario';
import type { Servicio } from './pages/Servicios';

// --- DATOS Y LÓGICA EXISTENTE (NO SE MODIFICAN) ---
export let productos: Producto[] = [
  {
    id: 1,
    nombre: "Jabón",
    descripcion: "Jabón neutro para piel sensible",
    cantidad: 20,
    precioCompra: 5.5,
    precioVenta: 10,
    proveedor: "JabonInc",
    img: "src/assets/jabon.jpg"
  },
  {
    id: 2,
    nombre: "Shampoo",
    descripcion: "Shampoo anticaspa",
    cantidad: 15,
    precioCompra: 12.3,
    precioVenta: 20,
    proveedor: "JabonInc",
    img: "src/assets/jabon.jpg"
  }
];

export let servicios: Servicio[] = [
  {
    id: 1,
    nombre: "Limpieza",
    fecha: "2025-05-21",
    descripcion: "",
    cobro: 100,
    costo: 50
  },
  {
    id: 2,
    nombre: "Cocina",
    descripcion: "",
    fecha: "2025-05-21",
    cobro: 250,
    costo: 30
  }
];

export const editProd = (algo: any) => {
  localStorage.setItem('productos', JSON.stringify(algo));
  console.log("Productos actualizados en localStorage:", localStorage.getItem('productos'));
};

export const edirServ = (algo: any) => {
  localStorage.setItem('servicios', JSON.stringify(algo));
  console.log("Servicios actualizados en localStorage:", localStorage.getItem('servicios'));
};
// --- FIN DE DATOS Y LÓGICA EXISTENTE ---


function NavBar() {
  useEffect(() => {
    if (!localStorage.getItem('productos')) {
        localStorage.setItem('productos', JSON.stringify(productos));
        console.log("Productos inicializados en localStorage");
    }
    if (!localStorage.getItem('servicios')) {
        localStorage.setItem('servicios', JSON.stringify(servicios));
        console.log("Servicios inicializados en localStorage");
    }
  }, []);

  return (
    <>
      <nav className="navbar-custom">
        <div className="container-fluid navbar-container-custom">
          
          <Link to="/" className="navbar-brand-custom">
            <FaBrain className="brand-icon-navbar" />
            <span>AsesoríasApp</span>
          </Link>

          <div className="navbar-user-links">
            <NavLink 
              to="/perfil" 
              className={({ isActive }) => isActive ? "nav-link-custom-navbar active" : "nav-link-custom-navbar"}
            >
              <FaUserCircle size={20} className="nav-icon-navbar" />
              <span>Mi Cuenta</span>
            </NavLink>
            <NavLink 
              to="/carrito" 
              className={({ isActive }) => isActive ? "nav-link-custom-navbar active" : "nav-link-custom-navbar"}
            >
              <FaShoppingCart size={20} className="nav-icon-navbar" />
              <span>Carrito</span>
            </NavLink>
          </div>
        </div>
      </nav>
      <style type="text/css">{`
        .navbar-custom {
          background-color: #2c3a4e; /* Color base solicitado (azul oscuro pizarra) */
          padding: 0 1.5rem; 
          height: 65px; 
          display: flex;
          align-items: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15); 
          position: fixed; 
          top: 0;
          left: 0;
          right: 0;
          z-index: 1030; 
        }

        .navbar-container-custom {
          display: flex;
          justify-content: space-between; 
          align-items: center;
          width: 100%;
        }

        .navbar-brand-custom {
          display: flex;
          align-items: center;
          font-size: 1.3rem; 
          font-weight: 600;
          color: #e0e7ff; /* Texto de marca: azul muy claro/blanquecino para contraste */
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .navbar-brand-custom:hover {
          color: #ffffff; /* Texto de marca al hover: blanco */
        }
        .brand-icon-navbar {
          margin-right: 0.6rem;
          font-size: 1.7rem; 
          color: #7aa0c9; /* Icono de marca: un azul más claro y suave que el fondo */
        }

        .navbar-user-links {
          display: flex;
          align-items: center;
          gap: 0.75rem; 
        }

        .nav-link-custom-navbar {
          display: flex;
          align-items: center;
          padding: 0.5rem 0.85rem; /* Ajuste de padding */
          color: #b0c4de; /* Texto de enlace inactivo: azul acero claro */
          text-decoration: none;
          border-radius: 0.375rem; 
          transition: background-color 0.2s ease, color 0.2s ease;
          font-size: 0.9rem; 
          font-weight: 500;
        }

        .nav-link-custom-navbar:hover {
          background-color: #3e526a; /* Fondo de enlace al hover: un tono más claro de #2c3a4e */
          color: #ffffff; /* Texto de enlace al hover: blanco */
        }

        .nav-link-custom-navbar.active {
          background-color: #0ea5e9; /* Fondo de enlace activo: azul claro vibrante (el "azul más claro") */
          color: #ffffff; /* Texto de enlace activo: blanco */
        }
        
        .nav-icon-navbar {
          margin-right: 0.4rem; 
        }

        /* Asegurar que el contenido no quede debajo del navbar fijo */
        /* Esto idealmente va en un CSS global o en el layout principal */
        /* body { 
             padding-top: 65px; 
           } 
        */
      `}</style>
    </>
  );
}

export default NavBar;