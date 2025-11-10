import React, { useState } from "react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { authAPI, storeAuth, getErrorMessage } from "../api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Password visibility toggle

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setIsLoading(true);

    try {
      // Prepare login payload
      const loginPayload = {
        email: formData.email,
        password: formData.password,
      };

      // Call backend API
      const response = await authAPI.login(loginPayload);

      // Check if login was successful
      if (response.data.success) {
        const { token, user } = response.data;

        // Store authentication data
        storeAuth(token, user);

        // Show success message
        setMessage("Login successful! Redirecting...");
        setMessageType("success");

        // Small delay for better UX, then navigate
        setTimeout(() => {
          // Navigate based on user role
          if (user.role === "admin") {
            navigate("/admin/dashboard");
          } else {
            navigate("/PostDashboard");
          }
        }, 1000);
      }
    } catch (err) {
      console.error("Login Error:", err);

      // Handle specific error cases
      if (err.response?.status === 403) {
        if (err.response.data?.message?.includes("pending admin approval")) {
          setMessage(
            "Your account is pending admin approval. Please wait for confirmation email."
          );
        } else if (err.response.data?.message?.includes("deactivated")) {
          setMessage("Your account has been deactivated. Please contact support.");
        } else {
          setMessage("Access denied. Please contact support.");
        }
      } else if (err.response?.status === 401) {
        setMessage("Invalid email or password. Please try again.");
      } else {
        // Generic error message
        setMessage(getErrorMessage(err));
      }

      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#181818] px-4 lg:pt-40">
      <div className="bg-black text-white rounded-sm -mt-70 shadow-2xl p-5 lg:w-[550px] w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Goldnest Logo" className="w-40 object-contain" />
        </div>

        <div className="flex justify-center mb-4">
          <span className="flex-grow h-[1px] bg-[#F4C16F]"></span>
          <span className="mx-3 text-[#fdc700] tracking-wider text-sm font-semibold">
            LOG IN
          </span>
          <span className="flex-grow h-[1px] bg-[#F4C16F]"></span>
        </div>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 bg-white text-black rounded mb-3"
            required
          />
          
          {/* Password field with visibility toggle */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-3 bg-white text-black rounded pr-12"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full ${
              isLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-[#F4C16F] hover:bg-[#e0b057]"
            } text-black font-semibold py-3 rounded transition`}
          >
            {isLoading ? "LOGGING IN..." : "LOGIN"}
          </button>
        </form>

        {message && (
          <div
            className={`text-center mt-4 text-sm p-3 rounded ${
              messageType === "success"
                ? "bg-green-900/30 text-green-400 border border-green-500"
                : "bg-red-900/30 text-red-400 border border-red-500"
            }`}
          >
            {message}
          </div>
        )}

        <div className="text-center mt-6 space-y-2">
          <button
            onClick={() => navigate("/ForgetPassword")}
            className="text-[#fdc700] hover:underline text-sm"
          >
            Forgot Password?
          </button>
          <p className="text-gray-400 text-sm">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-[#fdc700] hover:underline font-semibold"
            >
              Register here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
