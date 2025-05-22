import { Link } from "react-router-dom";
import { useState } from "react"; // Necesario para manejar el estado de los submenús
import { FaAngleDown, FaAngleUp } from "react-icons/fa"; // Iconos para indicar expansión

// Estructura de datos actualizada para los enlaces, incluyendo 'id' y 'sublinks'
const sidebarLinks = [
    {id: "clientes", to: "/clientes", label: "Clientes" }, // Enlace sin subenlaces
    { id: "contabilidad", to: "/contabilidad", label: "Contabilidad",
  sublinks: [ // Array de sub-enlaces
  { id: "Pronostico de flujo de efectivo", to: "/flujo", label: "Flujo de efectivo" },
  { id: "general", to: "/contabilidad", label: "General" },

],
},
  { id: "inventario", to: "/inventario", label: "Inventario" },
  { id: "ventas", to: "/ventas", label: "Ventas" },

  { id: "facturacion", to: "/facturacion", label: "Facturación" },
  {
    id: "proyecciones", // 'id' para el elemento padre del submenú
    label: "Proyecciones", // Etiqueta que se mostrará
    sublinks: [ // Array de sub-enlaces
      { id: "proyeccion_estandar", to: "/Proyecciones", label: "Proyección Estándar" },
      { id: "proyeccion_avanzada", to: "/proyeccionesC", label: "Proyección Avanzada" },
    ],
  },
];

export default function Sidebar() {
  // Estado para rastrear qué submenús están abiertos
  // La clave es el 'id' del enlace padre, el valor es un booleano
  const [openSubmenus, setOpenSubmenus] = useState<{ [key: string]: boolean }>({});

  // Función para alternar la visibilidad de un submenú
  const toggleSubmenu = (id: string) => {
    setOpenSubmenus(prev => ({
      ...prev,
      [id]: !prev[id] // Invierte el estado actual del submenú (abierto/cerrado)
    }));
  };

  return (
    <nav
      className="sidebar bg-light border-end px-3 py-4 position-fixed top-0 start-0 vh-100"
      style={{
        width: 200, // Se mantiene el ancho original
        zIndex: 1050,
        boxShadow: "2px 0 8px rgba(0,0,0,0.08)",
      }}
    >
      <div className="d-flex align-items-center mb-4">
        <Link to="/" className="fw-bold text-decoration-none fs-4 text-dark">
          <span className="me-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 0a8 8 0 108 8A8 8 0 008 0zm3.465 11.608l-1.41.327a.25.25 0 01-.3-.291l.52-2.161-1.654-1.401a.25.25 0 01.14-.443l2.219-.189.877-2.023a.25.25 0 01.458 0l.877 2.023 2.219.188a.25.25 0 01.14.443l-1.654 1.401.52 2.161a.25.25 0 01-.3.291l-1.41-.327-1.003 2.032a.25.25 0 01-.448 0z" />
            </svg>
          </span>
          AsesoríasApp
        </Link>
      </div>

      <ul className="nav flex-column">
        {sidebarLinks.map((link) => (
          <li className="nav-item mb-2" key={link.id}> {/* Usar link.id como clave */}
            {link.sublinks ? ( // Si el enlace tiene subenlaces, se renderiza como un elemento desplegable
              <>
                <div
                  onClick={() => toggleSubmenu(link.id)} // Llama a toggleSubmenu al hacer clic
                  className="nav-link text-dark d-flex justify-content-between align-items-center" // Clases para estilo y alineación
                  style={{ cursor: "pointer" }} // Cambia el cursor para indicar que es clickeable
                >
                  {link.label}
                  {/* Muestra un icono de flecha hacia arriba o hacia abajo según el estado del submenú */}
                  {openSubmenus[link.id] ? <FaAngleUp /> : <FaAngleDown />}
                </div>
                {/* Renderizado condicional del submenú */}
                {openSubmenus[link.id] && (
                  <ul className="nav flex-column ms-3"> {/* 'ms-3' para indentar los subenlaces */}
                    {link.sublinks.map(sublink => (
                      <li className="nav-item" key={sublink.id}> {/* Usar sublink.id como clave */}
                        <Link to={sublink.to} className="nav-link text-dark py-1"> {/* 'py-1' para un padding vertical más pequeño */}
                          {sublink.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : ( // Si no tiene subenlaces, se renderiza como un enlace normal
              <Link to={link.to!} className="nav-link text-dark"> {/* '!' para asegurar que 'to' existe */}
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}