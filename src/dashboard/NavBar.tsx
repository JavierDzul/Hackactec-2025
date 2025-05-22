import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserCircle, FaShoppingCart } from "react-icons/fa";
import type { Producto } from './pages/Inventario';
import type { Servicio } from './pages/Servicios';

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
  console.log(localStorage.getItem('productos'))
}

export const edirServ = (algo: any) => {
  localStorage.setItem('servicios', JSON.stringify(algo));
  console.log(localStorage.getItem('servicios'))
}



function NavBar() {
  const navbarStyle = {
    background: 'linear-gradient(45deg, #4F6D7A, #C0D6DF)',
  };

  useEffect(() => {
  localStorage.setItem('productos', JSON.stringify(productos));
  localStorage.setItem('servicios', JSON.stringify(servicios));
  console.log("Nav")
  }, []);

  return (
    <nav className="navbar navbar-expand-lg" style={navbarStyle}>
      <div className="container">
       
        <div className="d-flex align-items-center ms-auto">
          <Link className="nav-link text-white fw-semibold d-flex align-items-center m-1" to="/micuenta">
            <FaUserCircle size={22} className="me-1" />
            MiCuenta
          </Link>
          <Link className="nav-link text-white fw-semibold d-flex align-items-center m-1" to="/carrito">
            <FaShoppingCart size={22} className="me-1" />
            Carrito
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;