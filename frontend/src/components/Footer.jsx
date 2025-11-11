// src/components/Footer.jsx - MOBILE OPTIMIZED WITH WHITE SPACE FIX
import { Link } from "react-router-dom";
import { FaFacebookF, FaTwitter, FaYoutube } from "react-icons/fa";
import logo from "../assets/logo.png";

const Footer = () => {
  return (
    <footer className="bg-black text-white w-full relative">
      {/* Safety background layer - extends below footer to prevent white space */}
      <div className="absolute inset-0 -bottom-[200px] bg-black -z-10" />
      
      {/* Main Footer Content */}
      <div className="pt-8 sm:pt-12 lg:pt-20 pb-8 border-t border-yellow-600 relative z-10">
        {/* ====== TOP SECTION ====== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center space-y-6 md:flex-row md:justify-between md:items-center md:space-y-0">
          {/* Logo */}
          <Link to="/Home" className="flex justify-center md:justify-start">
            <img 
              src={logo} 
              alt="Logo" 
              className="w-32 sm:w-36 md:w-44 object-contain" 
            />
          </Link>

          {/* Navigation - Mobile Optimized */}
          <nav className="flex flex-col text-center space-y-3 text-sm sm:text-base md:text-lg md:flex-row md:space-y-0 md:space-x-6 lg:space-x-10">
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

          {/* Social Icons - Mobile Optimized */}
          <div className="flex space-x-6 text-xl sm:text-2xl">
            <FaFacebookF className="cursor-pointer hover:text-yellow-500 transition-colors" />
            <FaTwitter className="cursor-pointer hover:text-yellow-500 transition-colors" />
            <FaYoutube className="cursor-pointer hover:text-yellow-500 transition-colors" />
          </div>
        </div>

        {/* ====== DIVIDER ====== */}
        <hr className="border-yellow-600 my-6 w-full max-w-7xl mx-auto" />

        {/* ====== BOTTOM SECTION ====== */}
        <div className="text-center space-y-2 px-4">
          <p className="text-xs sm:text-sm text-gray-300">
            © 2025 GOLDNEST-INC.COM. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>

      {/* Extra black space at bottom - prevents white space on overscroll */}
      <div className="w-full h-32 sm:h-40 bg-black" />
      
      {/* Additional safety layer for mobile */}
      <div className="block sm:hidden w-full h-20 bg-black" />
    </footer>
  );
};

export default Footer;