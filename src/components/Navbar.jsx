import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import LogoIcon from "../assets/logo.png";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="flex items-center justify-between px-6 py-3 text-white relative z-50">
      {/* Logo */}
      <Link to="/Home" className="flex items-center cursor-pointer">
        <img
          src={LogoIcon}
          alt="Goldnest Logo"
          className="w-32 md:w-40 object-contain"
        />
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center space-x-8">
        {/* Navigation Buttons */}
        {[
          { to: "/Home", label: "Home" },
          { to: "/About", label: "About Us" },
          { to: "/Investment", label: "Investment" },
          { to: "/Partners", label: "Partners" },
          { to: "/ContactUs", label: "Contact Us" },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="group relative inline-flex flex-col items-center text-white font-medium transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0"
          >
            <span className="relative z-10">{label}</span>
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#f5c84c] transition-all duration-300 ease-in-out group-hover:w-full" />
          </Link>
        ))}

        {/* Login / Register Buttons */}
        <div className="flex items-center rounded-md overflow-hidden border border-gray-600 bg-black">
          <Link
            to="/Login"
            className="bg-[#f5c84c] text-black px-5 py-2 font-semibold transition-all duration-200 ease-in-out hover:bg-gray-200 hover:text-black"
          >
            Login
          </Link>

          <Link
            to="/Register"
            className="bg-gray-300 text-black px-5 py-2 font-semibold border-l border-gray-600 transition-all duration-200 ease-in-out hover:bg-gray-400 hover:text-black"
          >
            Register
          </Link>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden bg-[#f5c84c] text-black p-2 rounded z-20 cursor-pointer"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle menu"
      >
        {menuOpen ? <X /> : <Menu />}
      </button>

      {/* Mobile Dropdown */}
      <div
        className={`absolute top-16 right-4 w-64 bg-[#f5c84c] text-black rounded-lg shadow-lg flex flex-col items-start px-6 py-4 space-y-4 transform transition-all duration-200 ease-in-out origin-top-right ${
          menuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0"
        }`}
      >
        {[
          { to: "/Home", label: "Home" },
          { to: "/About", label: "About Us" },
          { to: "/Investment", label: "Investment" },
          { to: "/Partners", label: "Partners" },
          { to: "/ContactUs", label: "Contact Us" },
        ].map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="hover:underline cursor-pointer text-black"
            onClick={() => setMenuOpen(false)}
          >
            {label}
          </Link>
        ))}

        <div className="flex w-full justify-center pt-2">
          <div className="flex items-center rounded-md overflow-hidden border border-gray-700">
            <Link
              to="/Login"
              className="text-[#f5c84c] bg-yellow-500 px-4 py-1 font-medium hover:bg-gray-300 transition cursor-pointer"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>

            <Link
              to="/Register"
              className="bg-white text-black px-4 py-1 font-medium hover:bg-gray-300 transition border-l border-gray-700 cursor-pointer"
              onClick={() => setMenuOpen(false)}
            >
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
