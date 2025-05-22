import React from 'react';
import { Link } from 'react-router-dom';
import type { Producto } from './pages/Inventario';


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

export const editProd = (algo: any) => {
  localStorage.setItem('productos', JSON.stringify(algo));
  console.log(localStorage.getItem('productos'))
}



function NavBar() {
  const navbarStyle = {
    background: 'linear-gradient(45deg, #4F6D7A, #C0D6DF)',
  };

  useEffect(() => {
  localStorage.setItem('productos', JSON.stringify(productos));
  console.log("Nav")
  }, []);

  return (
    <nav className="navbar navbar-expand-lg" style={navbarStyle}>
      <div className="container">
        <Link className="navbar-brand fw-bold text-white" to="/">
          <span className="me-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              <path d="M8 0a8 8 0 108 8A8 8 0 008 0zm3.465 11.608l-1.41.327a.25.25 0 01-.3-.291l.52-2.161-1.654-1.401a.25.25 0 01.14-.443l2.219-.189.877-2.023a.25.25 0 01.458 0l.877 2.023 2.219.188a.25.25 0 01.14.443l-1.654 1.401.52 2.161a.25.25 0 01-.3.291l-1.41-.327-1.003 2.032a.25.25 0 01-.448 0z" />
            </svg>
          </span>
          AsesoríasApp
        </Link>

        <button
          className="navbar-toggler text-white border-white"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#NavBarContent"
          aria-controls="NavBarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="NavBarContent">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item mx-1">
              <Link className="nav-link text-white fw-semibold" to="/contabilidad">
                Contabilidad
              </Link>
            </li>
            <li className="nav-item mx-1">
              <Link className="nav-link text-white fw-semibold" to="/asesores">
                Asesores
              </Link>
            </li>
            <li className="nav-item mx-1">
              <Link className="nav-link text-white fw-semibold" to="/general">
                General
              </Link>
            </li>
            <li className="nav-item mx-1">
              <Link className="nav-link text-white fw-semibold" to="/inventario">
                Inventario
              </Link>
            </li>
            <li className="nav-item mx-1">
              <Link className="nav-link text-white fw-semibold" to="/ventas">
                Ventas
              </Link>
            </li>
            <li className="nav-item mx-1">
              <Link className="nav-link text-white fw-semibold" to="/facturacion">
                Facturación
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;