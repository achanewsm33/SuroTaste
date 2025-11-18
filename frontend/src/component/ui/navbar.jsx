import { useLocation, Link } from "react-router-dom";
import logo from "/src/assets/suro.png";
import { User } from "lucide-react";
import Home from "../pages/Home"; 
import About from "../pages/About"

export default function Navbar() {

  const location = useLocation(); // untuk cek page yang sedang aktif

  const navItems = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Contact", path: "/contact" },
  ];

  return (
    <header className="fixed top-0 left-0 w-full h-20 z-50 bg-white">
      <nav className="mx-auto sm:px-5 lg:px-12">
        <div className="flex items-center justify-between px-4 py-3">

          {/* Logo */}
          <div className="p-1 bg-dark-green flex items-center justify-center rounded">
            <img src={logo} alt="logo" className="w-14 h-14 object-contain" />
          </div>

          {/* Nav Menu */}
          <ul className="group flex items-center justify-center gap-8">
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={
                    "transition-all duration-200 text-primary-green " +
                    (location.pathname === item.path
                      ? "text-orange font-bold"
                      : "text-primary-green hover:text-orange hover:underline")
                  }
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* User Button */}
          <div className="bg-gray-400 rounded-full p-2">
            <Link to="/register">
              <User className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
