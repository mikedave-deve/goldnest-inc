import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { Eye, EyeOff } from "lucide-react";
import { authAPI, getErrorMessage } from "../api";



function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
     fullName: "",
    phone: "", 
    password: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Password visibility toggle
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Confirm password visibility toggle

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    setIsLoading(true);

    try {
      // Frontend validation
      if (formData.password !== formData.confirmPassword) {
        setMessage("Passwords do not match");
        setMessageType("error");
        setIsLoading(false);
        return;
      }

          // Basic client-side validation for required fields
    if (!formData.username || !formData.email || !formData.fullName || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

      if (formData.password.length < 6) {
        setMessage("Password must be at least 6 characters");
        setMessageType("error");
        setIsLoading(false);
        return;
      }

      // Validation for the required phone field
      if (!formData.phone.trim()) {
        setMessage("Phone number is required.");
        setMessageType("error");
        setIsLoading(false);
        return;
      }


      // Prepare registration payload
      const registerPayload = {
        username: formData.username,
        email: formData.email,
        fullName: formData.fullName,
        phone: formData.phone,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      // Call backend API
      const response = await authAPI.register(registerPayload);

      // Handle successful registration
      if (response.data.success) {
        setMessage(
          response.data.message || 
          "Registration successful! Your account is pending admin approval. You'll receive an email once approved."
        );
        setMessageType("success");
        
        // Redirect to login after 4 seconds
        setTimeout(() => {
          navigate("/login");
        }, 4000);
      }
    } catch (err) {
      console.error("Registration Error:", err);
      
      // Extract and display error message
      const errorMsg = getErrorMessage(err);
      setMessage(errorMsg);
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#181818] px-4 lg:pt-65">
      <div className="lg:-mt-60 mb-25 bg-black text-white rounded-xl shadow-2xl p-5 lg:w-[550px] w-450 max-w-full">
        <div className="flex justify-center mb-4">
          <img src={logo} alt="Goldnest Logo" className="w-40 object-contain" />
        </div>

        <div className="flex items-center justify-center mb-8">
          <span className="flex-grow h-[1px] bg-[#fdc700]"></span>
          <span className="mx-3 text-[#fdc700] text-sm font-semibold tracking-wider">
            CREATE YOUR ACCOUNT NOW
          </span>
          <span className="flex-grow h-[1px] bg-[#fdc700]"></span>
        </div>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-3 bg-white text-black rounded mb-3"
            required
            minLength={3}
            maxLength={50}
            pattern="[a-zA-Z0-9_]+"
            title="Username can only contain letters, numbers, and underscores"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-3 bg-white text-black rounded mb-3"
            required
          />
          
            <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full p-3 bg-white text-black rounded mb-3"
            required
          />

            <input
            type="tel"
            name="phone"
            placeholder="Phone Number (e.g., +15551234567)"
            value={formData.phone}
            onChange={handleChange}
            className="w-full p-3 bg-white text-black rounded mb-3"
            pattern="^\+?[\d\s\-\(\)]{7,30}$" 
            title="Enter a valid phone number, including country code (optional '+') and digits. Spaces and hyphens are allowed."
            required
          />

          {/* Password field with visibility toggle */}
          <div className="relative mb-3">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password (min 6 characters)"
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

          {/* Confirm Password field with visibility toggle */}
          <div className="relative mb-4">
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-3 bg-white text-black rounded pr-12"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800 focus:outline-none"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
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
                : "bg-[#D4AF37] hover:bg-[#c6a030]"
            } text-black font-semibold py-3 rounded transition`}
          >
            {isLoading ? "REGISTERING..." : "REGISTER"}
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

        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-[#fdc700] hover:underline font-semibold"
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;