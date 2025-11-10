import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import logo from "../assets/logo.png";
import { authAPI, getErrorMessage } from "../api";

function ResetPasswordConfirm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    confirmPasswordReset();
  }, []);

  const confirmPasswordReset = async () => {
    try {
      // Get token from URL query params
      // URL format: http://goldnest-inc.biz/?a=forgot_password&action=confirm&c=TOKEN
      const token = searchParams.get('c');
      
      if (!token) {
        setMessage("Invalid or missing reset token. Please request a new password reset.");
        setMessageType("error");
        setIsLoading(false);
        return;
      }

      // Call backend to confirm password reset
      // Backend should:
      // 1. Verify token
      // 2. Generate new random password
      // 3. Update user's password
      // 4. Send second email: "The password you requested" with username and new password
      const response = await authAPI.confirmPasswordReset({ token });

      if (response.data.success) {
        setMessage(
          "Password reset successful! A new password has been sent to your email. " +
          "Please check your inbox and use the new password to login."
        );
        setMessageType("success");
        
        // Redirect to login after 7 seconds
        setTimeout(() => navigate("/login"), 7000);
      }
    } catch (err) {
      console.error("Password Reset Confirmation Error:", err);
      
      if (err.response?.status === 400) {
        setMessage("Invalid or expired reset token. Please request a new password reset.");
      } else if (err.response?.status === 404) {
        setMessage("User not found. Please register or contact support.");
      } else {
        const errorMsg = getErrorMessage(err);
        setMessage(errorMsg || "Failed to reset password. Please try again.");
      }
      
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#181818] px-4">
      <div className="bg-black text-white rounded-sm shadow-2xl p-8 lg:w-[550px] w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Goldnest Logo" className="w-40 object-contain" />
        </div>

        {/* Title with gold lines */}
        <div className="flex items-center justify-center mb-8">
          <span className="flex-grow h-[1px] bg-[#D4AF37]"></span>
          <span className="mx-3 text-[#fdc700] text-sm font-semibold tracking-wider">
            PASSWORD RESET
          </span>
          <span className="flex-grow h-[1px] bg-[#D4AF37]"></span>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4AF37] mx-auto mb-4"></div>
            <p className="text-gray-300">Confirming password reset...</p>
          </div>
        ) : (
          <>
            {message && (
              <div
                className={`text-center p-4 rounded ${
                  messageType === "success"
                    ? "bg-green-900/30 text-green-400 border border-green-500"
                    : "bg-red-900/30 text-red-400 border border-red-500"
                }`}
              >
                {message}
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 space-y-3">
              {messageType === "success" ? (
                <button
                  onClick={() => navigate("/login")}
                  className="w-full bg-[#D4AF37] hover:bg-[#c6a030] text-black font-semibold py-3 rounded transition"
                >
                  GO TO LOGIN
                </button>
              ) : (
                <>
                  <button
                    onClick={() => navigate("/forgot-password")}
                    className="w-full bg-[#D4AF37] hover:bg-[#c6a030] text-black font-semibold py-3 rounded transition"
                  >
                    REQUEST NEW RESET LINK
                  </button>
                  <button
                    onClick={() => navigate("/login")}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 rounded transition"
                  >
                    BACK TO LOGIN
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordConfirm;