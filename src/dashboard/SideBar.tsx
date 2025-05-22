import { NavLink, Link } from "react-router-dom"; // Usar NavLink para active state
import { useState } from "react";
import { 
  FaAngleDown, FaAngleUp, FaTachometerAlt, FaUsers, FaBoxOpen, 
  FaClipboardList, FaShoppingCart, FaFileInvoiceDollar, FaCalculator, 
  FaShieldAlt, FaChartLine, FaBrain, FaCashRegister, FaChartPie, FaTasks, FaBalanceScale 
} from "react-icons/fa";

// Estructura de datos actualizada con iconos
const sidebarLinks = [
    {id: "dashboard", to: "/", label: "Dashboard", icon: <FaTachometerAlt /> },
    {id: "clientes", to: "/clientes", label: "Clientes", icon: <FaUsers /> },
    {id: "inventario", to: "/inventario", label: "Inventario", icon: <FaBoxOpen /> },
    {id: "servicios", to: "/servicios", label: "Servicios", icon: <FaClipboardList /> },
    {id: "ventas", to: "/ventas", label: "Ventas", icon: <FaShoppingCart /> },
    {id: "facturacion", to: "/facturacion", label: "Facturación", icon: <FaFileInvoiceDollar /> },
    { 
      id: "contabilidad", 
      label: "Contabilidad", 
      icon: <FaCalculator />,
      sublinks: [
        { id: "cont_flujo_efectivo", to: "/flujo", label: "Flujo de Efectivo", icon: <FaCashRegister /> },
        { id: "cont_optimizacion_recursos", to: "/optimizacion", label: "Optimización Recursos", icon: <FaChartPie /> },
        { id: "cont_general", to: "/contabilidad", label: "Visión General", icon: <FaTasks /> },
      ],
    },
    { id: "riesgos", to: "/riesgos", label: "Riesgos y Resiliencia", icon: <FaShieldAlt /> },
    {
      id: "proyecciones",
      label: "Proyecciones",
      icon: <FaChartLine />,
      sublinks: [
        { id: "proy_estandar", to: "/Proyecciones", label: "Estándar", icon: <FaChartLine /> },
        { id: "proy_avanzada", to: "/Proyeccionesc", label: "Avanzada", icon: <FaBalanceScale /> },
      ],
    },
];

export default function Sidebar() {
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});

  const toggleSubmenu = (id: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <>
      <nav className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <FaBrain className="brand-icon" />
            <span>AsesoríasApp</span>
          </Link>
        </div>

        <div className="sidebar-links-container">
          <ul className="nav flex-column sidebar-nav-list">
            {sidebarLinks.map((link) => (
              <li className="nav-item" key={link.id}>
                {link.sublinks ? (
                  <>
                    <div
                      onClick={() => toggleSubmenu(link.id)}
                      className={`nav-link-custom has-submenu ${openSubmenus[link.id] ? 'submenu-link-open' : ''}`}
                      role="button" // Mejor para accesibilidad
                      aria-expanded={openSubmenus[link.id] ? 'true' : 'false'}
                      aria-controls={`submenu-${link.id}`} // Para accesibilidad
                    >
                      {link.icon && <span className="nav-icon">{link.icon}</span>}
                      <span className="link-text">{link.label}</span>
                      <span className="submenu-arrow">
                        {openSubmenus[link.id] ? <FaAngleUp /> : <FaAngleDown />}
                      </span>
                    </div>
                    <ul 
                      className={`nav flex-column sub-menu ${openSubmenus[link.id] ? 'submenu-visible' : ''}`}
                      id={`submenu-${link.id}`} // Para accesibilidad
                    >
                      {link.sublinks.map(sublink => (
                        <li className="nav-item" key={sublink.id}>
                          <NavLink 
                            to={sublink.to} 
                            className={({ isActive }) => isActive ? "nav-link-custom sub-link active" : "nav-link-custom sub-link"}
                          >
                            {sublink.icon && <span className="nav-icon sub-icon">{sublink.icon}</span>}
                            <span className="link-text">{sublink.label}</span>
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <NavLink 
                    to={link.to!} 
                    className={({ isActive }) => isActive ? "nav-link-custom active" : "nav-link-custom"}
                  >
                    {link.icon && <span className="nav-icon">{link.icon}</span>}
                    <span className="link-text">{link.label}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <style type="text/css">{`
        .sidebar {
          width: 220px;
          height: 100vh;
          position: fixed;
          top: 0;
          left: 0;
          background-color: #1e293b;
          color: #e2e8f0;
          display: flex;
          flex-direction: column;
          z-index: 1050;
          box-shadow: 3px 0 15px -3px rgba(0,0,0,0.2);
          transition: width 0.3s ease;
        }

        .sidebar-header {
          padding: 1.25rem 1rem;
          display: flex;
          align-items: center;
          border-bottom: 1px solid #334155;
          height: 70px; /* Altura fija para cálculo de scroll */
        }

        .sidebar-brand {
          display: flex;
          align-items: center;
          font-size: 1.4rem;
          font-weight: 600;
          color: #ffffff;
          text-decoration: none;
          transition: opacity 0.3s ease;
        }
        .sidebar-brand:hover {
          opacity: 0.9;
          color: #ffffff;
        }
        .brand-icon {
          margin-right: 0.75rem;
          font-size: 1.8rem;
          color: #38bdf8;
        }

        .sidebar-links-container {
          flex-grow: 1;
          overflow-y: auto;
          padding: 1rem 0;
          scrollbar-width: thin;
          scrollbar-color: #475569 #1e293b;
        }
        .sidebar-links-container::-webkit-scrollbar {
          width: 8px;
        }
        .sidebar-links-container::-webkit-scrollbar-track {
          background: #1e293b;
        }
        .sidebar-links-container::-webkit-scrollbar-thumb {
          background-color: #475569;
          border-radius: 4px;
          border: 2px solid #1e293b;
        }
        
        .sidebar-nav-list {
          padding-left: 0;
          list-style: none;
        }

        .nav-item {
          margin-bottom: 0.1rem;
        }
        
        .nav-link-custom {
          display: flex;
          align-items: center;
          padding: 0.8rem 1.25rem;
          margin: 0 0.75rem;
          color: #94a3b8;
          text-decoration: none;
          border-radius: 0.375rem;
          transition: background-color 0.2s ease, color 0.2s ease;
          cursor: pointer;
          font-size: 0.95rem;
        }

        .nav-link-custom:hover {
          background-color: #334155;
          color: #f1f5f9;
        }

        .nav-link-custom.active {
          background-color: #0ea5e9;
          color: #ffffff;
          font-weight: 500;
        }
        .nav-link-custom.active .nav-icon {
          color: #ffffff;
        }
        
        .nav-link-custom.has-submenu.submenu-link-open { /* Estilo para el link padre cuando el submenú está abierto */
           background-color: #2c3a4e; /* Un poco diferente al hover normal */
           color: #cbd5e1;
        }

        .nav-icon {
          margin-right: 0.85rem;
          font-size: 1.1rem;
          width: 20px;
          text-align: center;
          color: #64748b;
          transition: color 0.2s ease;
        }
        .nav-link-custom:hover .nav-icon {
            color: #94a3b8;
        }
         .nav-link-custom.active .nav-icon {
            color: #ffffff;
        }

        .link-text {
          flex-grow: 1;
        }

        .submenu-arrow {
          margin-left: auto;
          font-size: 0.8rem;
          transition: transform 0.3s ease; /* Coincide con la transición del submenú */
        }
        /* La rotación del ícono ya se maneja por el cambio de FaAngleDown a FaAngleUp */
        /* Si se usara el mismo ícono, esto sería útil: */
        /* .submenu-link-open .submenu-arrow {
             transform: rotate(180deg);
        } */


        .sub-menu {
          list-style: none;
          padding-left: 1.5rem; 
          margin-left: 1.75rem; 
          border-left: 2px solid #334155; 
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease-out, padding-top 0.3s ease-out, padding-bottom 0.3s ease-out, opacity 0.3s ease-out;
          padding-top: 0;
          padding-bottom: 0;
          opacity: 0; /* Para un fade in/out sutil */
        }
        
        .sub-menu.submenu-visible {
          max-height: 500px; /* Ajustar si hay muchos subenlaces */
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
          opacity: 1;
        }

        .sub-menu .nav-item {
          margin-bottom: 0;
        }
        
        .sub-link {
          padding: 0.6rem 1rem;
          font-size: 0.9rem;
          margin: 0;
          border-radius: 0.25rem;
          position: relative;
          color: #94a3b8;
        }
        .sub-link::before {
            content: '';
            width: 5px;
            height: 5px;
            background-color: #475569;
            border-radius: 50%;
            position: absolute;
            left: -0.9rem;
            top: 50%;
            transform: translateY(-50%);
            transition: background-color 0.2s ease;
        }
        .sub-link:hover::before {
            background-color: #94a3b8;
        }
        .sub-link.active::before {
            background-color: #0ea5e9;
        }

        .sub-link:hover {
          background-color: #2c3a4e;
          color: #e2e8f0;
        }
        .sub-link.active {
          color: #ffffff;
          background-color: transparent; 
          font-weight: 500;
        }
        .sub-icon {
          font-size: 0.9rem;
          color: #64748b;
        }
        .sub-link:hover .sub-icon, .sub-link.active .sub-icon {
            color: inherit;
        }

      `}</style>
    </>
  );
}