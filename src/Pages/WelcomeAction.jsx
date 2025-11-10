import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { userAPI, authAPI, isAuthenticated } from "../api";

const WelcomeAction = ({ username: initialUsername }) => {
  const [username, setUsername] = useState(initialUsername || "");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Use prop username if provided, otherwise fetch from backend
    if (initialUsername) {
      setUsername(initialUsername);
      setLoading(false);
    } else {
      fetchUser();
    }
  }, [initialUsername]);

  const fetchUser = async () => {
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
        console.warn("Dashboard fetch failed in WelcomeAction, trying profile...", dashErr);
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
          console.warn("Profile fetch failed in WelcomeAction, trying auth/me...", profileErr);
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
          console.warn("Auth/me fetch failed in WelcomeAction", authErr);
        }
      }

      // Try 4: localStorage (ultimate fallback)
      if (!fetchedUsername) {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        fetchedUsername = userInfo.username;
      }

      if (fetchedUsername) {
        setUsername(fetchedUsername);
        console.log("User data fetched for welcome:", fetchedUsername);
      } else {
        // No username found - use generic fallback
        setUsername("User");
        console.warn("Unable to fetch username, using generic fallback");
      }
    } catch (err) {
      console.warn("Error fetching user for welcome:", err);
      
      // Try localStorage one last time
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      if (userInfo.username) {
        setUsername(userInfo.username);
      } else {
        // Use generic fallback
        setUsername("User");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-[#222] rounded-lg p-6 mb-10 flex flex-col md:flex-row justify-between items-center">
      <h2 className="text-xl md:text-2xl font-semibold">
        Welcome, <span className="text-yellow-500">
          {loading ? "..." : username}
        </span>
      </h2>
      <a href="/AddDeposit" className="inline-block">
        <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded mt-4 md:mt-0">
          Make an investment
        </button>
      </a>
    </div>
  );
};

export default WelcomeAction;