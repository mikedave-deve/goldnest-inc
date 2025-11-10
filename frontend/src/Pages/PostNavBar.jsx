// src/components/PostNavbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
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
    // Use prop username if provided, otherwise fetch from backend
    if (propUsername) {
      setUsername(propUsername);
      setLoading(false);
    } else {
      fetchUserData();
    }
  }, [propUsername]);

  const fetchUserData = async () => {
    try {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        navigate("/login");
        return;
      }

      setLoading(true);

      // Try multiple endpoints to get username
      let fetchedUsername = null;

      // Try 1: Dashboard endpoint (most reliable)
      try {
        const dashboardRes = await userAPI.getDashboard();
        if (dashboardRes.data.success && dashboardRes.data.dashboard?.username) {
          fetchedUsername = dashboardRes.data.dashboard.username;
        }
      } catch (dashErr) {
        console.warn("Dashboard fetch failed, trying profile...", dashErr);
      }

      // Try 2: Profile endpoint (if dashboard failed)
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

      // Try 3: Auth/me endpoint (final fallback)
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

      // Try 4: localStorage (ultimate fallback)
      if (!fetchedUsername) {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        fetchedUsername = userInfo.username;
      }

      if (fetchedUsername) {
        setUsername(fetchedUsername);
        console.log("User data fetched:", fetchedUsername);
      } else {
        // No username found anywhere - redirect to login
        console.error("Unable to fetch username from any source");
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
        navigate("/login");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      
      // Try localStorage one last time
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (userInfo.username) {
        setUsername(userInfo.username);
      } else {
        // If we have a token but can't get user data, might be token issue
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
    localStorage.removeItem("token");
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <nav className="bg-black text-white shadow-md border-b border-yellow-500 relative">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/PostDashboard" className="flex items-center space-x-2">
          <img src={LogoIcon} alt="GoldNest Logo" className="w-32 object-contain" />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center space-x-8">
          <Link to="/PostDashboard" className="hover:text-yellow-400">Dashboard</Link>
          <Link to="/AddDeposit" className="hover:text-yellow-400">Add Deposit</Link>
          <Link to="/AskForWithdrawal" className="hover:text-yellow-400">Withdraw</Link>
          <Link to="/ActiveDeposit" className="hover:text-yellow-400">Deposits</Link>
          <Link to="/TransactionHistory" className="hover:text-yellow-400">History</Link>
          <Link to="/Referral" className="hover:text-yellow-400">Partners</Link>
          <Link to="/ProfileSettings" className="hover:text-yellow-400">Settings</Link>

          {/* Dropdown */}
          <div className="relative">
            <button onClick={toggleDropdown} className="flex items-center space-x-2 cursor-pointer">
              <img
                src={HorseLogo}
                alt="User avatar"
                className="w-8 h-8 rounded-full object-cover border border-yellow-500"
              />
              <span className="text-yellow-400 font-semibold">
                {loading ? "Loading..." : username || "User"}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 bg-[#1a1a1a] border border-yellow-500 rounded-lg shadow-lg w-40 z-50">
                <Link to="/PostDashboard" className="block px-4 py-2 text-sm hover:bg-yellow-500 hover:text-black">
                  Dashboard
                </Link>
                <Link to="/ContactUs" className="block px-4 py-2 text-sm hover:bg-yellow-500 hover:text-black">
                  Support
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-yellow-500 hover:text-black"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="flex items-center lg:hidden space-x-3">
          <button onClick={toggleDropdown} className="flex items-center space-x-2">
            <img
              src={HorseLogo}
              alt="User avatar"
              className="w-8 h-8 rounded-full object-cover border border-yellow-500"
            />
            <span className="text-yellow-400 font-semibold text-sm">
              {loading ? "Loading..." : username || "User"}
            </span>
            <ChevronDown className="w-4 h-4" />
          </button>

          <button onClick={toggleMenu} className="bg-yellow-400 text-black p-2 rounded">
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#111] border-t border-yellow-500">
          <div className="flex flex-col px-6 py-3 space-y-2">
            <Link to="/PostDashboard" className="hover:text-yellow-400">Dashboard</Link>
            <Link to="/AddDeposit" className="hover:text-yellow-400">Add Deposit</Link>
            <Link to="/AskForWithdrawal" className="hover:text-yellow-400">Withdraw</Link>
            <Link to="/ActiveDeposit" className="hover:text-yellow-400">Deposits</Link>
            <Link to="/TransactionHistory" className="hover:text-yellow-400">History</Link>
            <Link to="/Referral" className="hover:text-yellow-400">Partners</Link>
            <Link to="/ProfileSettings" className="hover:text-yellow-400">Settings</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default PostNavbar;

