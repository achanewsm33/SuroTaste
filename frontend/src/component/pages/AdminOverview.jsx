import { useState } from "react";
import Sidebar from "../ui/Sidebar.jsx";       // <- ../ karena ui dan pages adalah siblings
import Dasboard from "./admin/Dasboard.jsx";
import Waroeng from "./admin/Waroeng.jsx";

export default function AdminOverview() {
  const [active, setActive] = useState('dasboard');

  return(
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar active={active} setActive={setActive} />
      <div className="overview flex-1 flex flex-col min-h-0">
        <main className="flex-1 p-6 h-[calc(100vh-5rem)">
          {active === "dasboard" && <Dasboard/>}
          {active === "waroeng" && <Waroeng/>}
          {active === "setting" && <div>Settings</div>}
        </main>
      </div>
    </div>
  );
}
