// src/components/PostNavbar.jsx - MOBILE OPTIMIZED
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";
import LogoIcon from "../assets/logo.png";
import HorseLogo from "../assets/horselogo.png";
import { userAPI, authAPI, isAuthenticated } from "../api";

const PostNavbar = ({ username: propUsername }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (propUsername) {
      setUsername(propUsername);
      setLoading(false);
    } else {
      fetchUserData();
    }
  }, [propUsername]);

  const fetchUserData = async () => {
    try {
      if (!isAuthenticated()) {
        navigate("/login");
        return;
      }

      setLoading(true);
      let fetchedUsername = null;

      try {
        const dashboardRes = await userAPI.getDashboard();
        if (dashboardRes.data.success && dashboardRes.data.dashboard?.username) {
          fetchedUsername = dashboardRes.data.dashboard.username;
        }
      } catch (dashErr) {
        console.warn("Dashboard fetch failed, trying profile...", dashErr);
      }

      if (!fetchedUsername) {
        try {
          const profileRes = await userAPI.getProfile();
          if (profileRes.data.success) {
            const profile = profileRes.data.profile || profileRes.data.user || profileRes.data;
            fetchedUsername = profile.username;
          }
        } catch (profileErr) {
          console.warn("Profile fetch failed, trying auth/me...", profileErr);
        }
      }

      if (!fetchedUsername) {
        try {
          const authRes = await authAPI.getProfile();
          if (authRes.data.success) {
            const user = authRes.data.user || authRes.data;
            fetchedUsername = user.username;
          }
        } catch (authErr) {
          console.warn("Auth/me fetch failed", authErr);
        }
      }

      if (!fetchedUsername) {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        fetchedUsername = userInfo.username;
      }

      if (fetchedUsername) {
        setUsername(fetchedUsername);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        navigate("/login");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (userInfo.username) {
        setUsername(userInfo.username);
      } else {
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          navigate("/login");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("userInfo");
      navigate("/login");
    }
  };

  const closeMenus = () => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  return (
    <nav className="bg-black text-white shadow-md border-b border-yellow-500 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/PostDashboard" className="flex items-center space-x-2" onClick={closeMenus}>
          <img src={LogoIcon} alt="GoldNest Logo" className="w-28 sm:w-32 object-contain" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-6">
          <Link to="/PostDashboard" className="hover:text-yellow-400 transition">Dashboard</Link>
          <Link to="/AddDeposit" className="hover:text-yellow-400 transition">Add Deposit</Link>
          <Link to="/AskForWithdrawal" className="hover:text-yellow-400 transition">Withdraw</Link>
          <Link to="/ActiveDeposit" className="hover:text-yellow-400 transition">Deposits</Link>
          <Link to="/TransactionHistory" className="hover:text-yellow-400 transition">History</Link>
          <Link to="/Referral" className="hover:text-yellow-400 transition">Partners</Link>
          <Link to="/ProfileSettings" className="hover:text-yellow-400 transition">Settings</Link>

          {/* Desktop Dropdown */}
          <div className="relative">
            <button onClick={toggleDropdown} className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition">
              <img
                src={HorseLogo}
                alt="User avatar"
                className="w-8 h-8 rounded-full object-cover border-2 border-yellow-500"
              />
              <span className="text-yellow-400 font-semibold">
                {loading ? "..." : username || "User"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-[#1a1a1a] border border-yellow-500 rounded-lg shadow-lg w-44 z-50 overflow-hidden">
                <Link to="/PostDashboard" className="block px-4 py-3 text-sm hover:bg-yellow-500 hover:text-black transition" onClick={closeMenus}>
                  Dashboard
                </Link>
                <Link to="/ContactUs" className="block px-4 py-3 text-sm hover:bg-yellow-500 hover:text-black transition" onClick={closeMenus}>
                  Support
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-red-600 hover:text-white transition flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Controls */}
        <div className="flex items-center lg:hidden space-x-2">
          {/* Mobile User Avatar */}
          <button onClick={toggleDropdown} className="flex items-center space-x-2 hover:opacity-80 transition">
            <img
              src={HorseLogo}
              alt="User avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-yellow-500"
            />
            <span className="text-yellow-400 font-semibold text-sm max-w-[80px] truncate">
              {loading ? "..." : username || "User"}
            </span>
          </button>

          {/* Mobile Menu Button */}
          <button onClick={toggleMenu} className="bg-yellow-500 text-black p-2 rounded-md hover:bg-yellow-600 transition">
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#0a0a0a] border-t border-yellow-500 shadow-lg">
          <div className="flex flex-col px-4 py-3 space-y-1 max-h-[calc(100vh-80px)] overflow-y-auto">
            <Link 
              to="/PostDashboard" 
              className="px-4 py-3 hover:bg-yellow-500 hover:text-black rounded transition text-sm font-medium"
              onClick={closeMenus}
            >
              Dashboard
            </Link>
            <Link 
              to="/AddDeposit" 
              className="px-4 py-3 hover:bg-yellow-500 hover:text-black rounded transition text-sm font-medium"
              onClick={closeMenus}
            >
              Add Deposit
            </Link>
            <Link 
              to="/AskForWithdrawal" 
              className="px-4 py-3 hover:bg-yellow-500 hover:text-black rounded transition text-sm font-medium"
              onClick={closeMenus}
            >
              Withdraw
            </Link>
            <Link 
              to="/ActiveDeposit" 
              className="px-4 py-3 hover:bg-yellow-500 hover:text-black rounded transition text-sm font-medium"
              onClick={closeMenus}
            >
              Active Deposits
            </Link>
            <Link 
              to="/TransactionHistory" 
              className="px-4 py-3 hover:bg-yellow-500 hover:text-black rounded transition text-sm font-medium"
              onClick={closeMenus}
            >
              Transaction History
            </Link>
            <Link 
              to="/Referral" 
              className="px-4 py-3 hover:bg-yellow-500 hover:text-black rounded transition text-sm font-medium"
              onClick={closeMenus}
            >
              Partners
            </Link>
            <Link 
              to="/ProfileSettings" 
              className="px-4 py-3 hover:bg-yellow-500 hover:text-black rounded transition text-sm font-medium"
              onClick={closeMenus}
            >
              Settings
            </Link>
            <Link 
              to="/ContactUs" 
              className="px-4 py-3 hover:bg-yellow-500 hover:text-black rounded transition text-sm font-medium"
              onClick={closeMenus}
            >
              Support
            </Link>
            
            {/* Mobile Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded transition text-sm font-medium mt-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PostNavbar;