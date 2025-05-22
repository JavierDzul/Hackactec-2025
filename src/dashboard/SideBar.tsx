import { Link } from "react-router-dom";

const sidebarLinks = [
  { to: "/contabilidad", label: "Contabilidad" },
  { to: "/asesores", label: "Asesores" },
  { to: "/general", label: "General" },
  { to: "/inventario", label: "Inventario" },
  { to: "/ventas", label: "Ventas" },
  { to: "/facturacion", label: "Facturación" },
];

export default function Sidebar() {
  return (
    <nav
      className="sidebar bg-light border-end px-3 py-4 position-fixed top-0 start-0 vh-100"
      style={{
        width: 240,
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
          <li className="nav-item mb-2" key={link.to}>
            <Link to={link.to} className="nav-link text-dark">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}