import logo from '/src/assets/suro.png';
import {LayoutDashboard, Store, Settings} from 'lucide-react';


const items = [
  {id: "dasboard", label: "Dasboard", icon: LayoutDashboard},
  { id: "waroeng", label: "Waroeng", icon: Store },
  { id: "setting", label: "Settings", icon: Settings },
];


function Sidebar({active, setActive}) {
  if (typeof setActive !== "function") {
    console.warn("Sidebar: setActive is not a function", setActive);
  }

  return (
    <aside className="w-full max-w-64 min-w-40 flex-shrink-0 bg-primary-green items-center justify-start min-h-screen">
      <div>
        <div className="mt-6 p-3 flex items-center justify-center bg-amber-50">
          <img src={logo} alt="logo" className="w-20 h-20 object-contain" />
        </div>

      {/* Navigation */}
        <nav className="py-2 pl-7">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === active;

            return (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={
                  `group flex items-center gap-4 px-3 w-full text-left mt-3 py-1.5 ` +
                  (isActive
                    ? " bg-gray-50 rounded-l-full text-primary-green"     // aktif: putih + rounded kiri + teks hitam, masih ada hover effect
                    : " hover:bg-white/10 hover:rounded-l-full")                  // non-aktif: hover bikin bg putih transparan + rounded kiri
                }
              >
                <div
                  className={
                    `p-2 flex items-center justify-center` +
                    (isActive ? " bg-transparent" : " group-hover:bg-white/10 group-hover:rounded-full")
                  }
                >
                  <Icon className={
                    `w-5 h-5` +
                    (isActive ? "font-semibold text-primary-green" : " text-white group-hover:text-primary")
                  } />
                </div>

                  <span className={`transition-colors duration-150 ${isActive ? "font-semibold text-primary-green" : "font-medium"}`}>{item.label}</span>

              </button>
            );
          })}
        </nav>
      
      </div>
    </aside>
  );
}

export default Sidebar;
