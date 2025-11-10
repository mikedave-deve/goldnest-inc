// src/components/AdminNavbar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, LayoutDashboard, Users, DollarSign, TrendingUp, Settings, LogOut } from "lucide-react";
import LogoIcon from "../assets/logo.png";
import { logout, getUserInfo } from "../api";

const AdminNavbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = getUserInfo();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const navLinks = [
    { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/deposits", label: "Deposits", icon: DollarSign },
    { to: "/admin/withdrawals", label: "Withdrawals", icon: TrendingUp },
    { to: "/admin/transactions", label: "Transactions", icon: TrendingUp },
    { to: "/admin/referrals", label: "Referrals", icon: TrendingUp },
    { to: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-black text-white shadow-md border-b border-yellow-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/admin/dashboard" className="flex items-center space-x-2">
          <img src={LogoIcon} alt="GoldNest Logo" className="w-32 object-contain" />
          <span className="text-yellow-400 font-semibold text-sm">ADMIN</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`flex items-center space-x-2 px-3 py-2 rounded transition ${
                  isActive(link.to)
                    ? "bg-yellow-500 text-black"
                    : "text-gray-300 hover:text-yellow-400"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4 border-l border-gray-700 pl-4">
            <div className="text-right">
              <p className="text-sm text-yellow-400 font-semibold">{userInfo?.username || "Admin"}</p>
              <p className="text-xs text-gray-400">{userInfo?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center space-x-2 transition"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button onClick={toggleMenu} className="lg:hidden bg-yellow-400 text-black p-2 rounded">
          {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#111] border-t border-yellow-500">
          <div className="flex flex-col px-6 py-3 space-y-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded transition ${
                    isActive(link.to)
                      ? "bg-yellow-500 text-black"
                      : "text-gray-300 hover:text-yellow-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 text-red-400 hover:text-red-300 px-3 py-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;