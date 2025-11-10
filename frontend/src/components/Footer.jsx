import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";
import logo from "../assets/logo.png"; // replace with your actual logo path

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-30 pb-6 border-t border-yellow-600">
      {/* ====== TOP SECTION ====== */}
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center space-y-6 md:flex-row md:justify-between md:items-center md:space-y-0">
        {/* Logo (left on large, top on mobile) */}
        <Link to="/Home">
        <img src={logo} alt="Logo" className=" w-36 md:w-44" />
        </Link>

        {/* Navigation (center on large, stacked on mobile) */}
        <nav className="flex flex-col text-center space-y-3 text-lg md:flex-row md:space-y-0 md:space-x-10">
          <Link to="/Home">
          <button className="group relative inline-flex flex-col items-center text-white font-medium transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0">
            <span className="relative z-10">Home</span>
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#f5c84c] transition-all duration-300 ease-in-out group-hover:w-full" />
          </button>
        </Link>

        <Link to="/About">
          <button className="group relative inline-flex flex-col items-center text-white font-medium transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0">
            <span className="relative z-10">About Us</span>
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#f5c84c] transition-all duration-300 ease-in-out group-hover:w-full" />
          </button>
        </Link>

        <Link to="/Investment">
          <button className="group relative inline-flex flex-col items-center text-white font-medium transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0">
            <span className="relative z-10">Investment</span>
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#f5c84c] transition-all duration-300 ease-in-out group-hover:w-full" />
          </button>
        </Link>

        <Link to="/Partners">
          <button className="group relative inline-flex flex-col items-center text-white font-medium transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0">
            <span className="relative z-10">Partners</span>
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#f5c84c] transition-all duration-300 ease-in-out group-hover:w-full" />
          </button>
        </Link>

        <Link to="/ContactUs">
          <button className="group relative inline-flex flex-col items-center text-white font-medium transition-colors duration-200 cursor-pointer bg-transparent border-0 p-0">
            <span className="relative z-10">Contact Us</span>
            <span className="absolute left-0 -bottom-1 h-[2px] w-0 bg-[#f5c84c] transition-all duration-300 ease-in-out group-hover:w-full" />
          </button>
        </Link>

        
        </nav>

        {/* Social Icons (right on large, under logo on mobile) */}
        <div className="flex space-x-6 text-2xl">
          <FaFacebookF className="cursor-pointer hover:text-yellow-500 transition-colors" />
          <FaTwitter className="cursor-pointer hover:text-yellow-500 transition-colors" />
          <FaYoutube className="cursor-pointer hover:text-yellow-500 transition-colors" />
        </div>
      </div>

      {/* ====== DIVIDER ====== */}
      <hr className="border-yellow-600 my-6 w-full max-w-7xl mx-auto" />

      {/* ====== BOTTOM SECTION ====== */}
      <div className="text-center space-y-2">
        
        <p className="text-sm text-gray-300">
          © 2025 GOLDNEST-INC.COM. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};

export default Footer;