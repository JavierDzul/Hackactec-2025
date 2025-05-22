import type { FC } from "react";
import NavBar from "../NavBar";
import Sidebar from "../SideBar";

interface Props {
    children: React.ReactNode; 
}

export const DashboardLayout: FC<Props> = ({ children }) => {
  return (
    <div>
      <NavBar />
      <div className="d-flex">
        <Sidebar />
        <main className="flex-grow-1" style={{ marginLeft: 188, marginTop:40}}>
          <div className="container-fluid">
            { children }
          </div>
        </main>
      </div>
    </div>
  )
}