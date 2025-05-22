
import type { FC } from "react";
import NavBar from "../NavBar";
import type { Producto } from "../pages/Inventario";
interface Props {
    children: React.ReactNode; 
}


export const DashboardLayout: FC<Props> = ({ children }) => {
  return (
    <div>
        <div>

            <NavBar />


            <main>
                <div className="container-fluid">
                    { children }
                </div>
            </main>

        </div>

    </div>
  )
}