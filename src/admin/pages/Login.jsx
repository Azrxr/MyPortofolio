import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loginWithGoogle } from "../services/adminAuth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    setError("");
    try {
      setLoading(true);
      await loginWithGoogle();
      const from = location.state?.from || "/admin/dashboard";
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err?.code === "admin/unauthorized-email"
        ? "Email tidak diizinkan untuk admin."
        : "Login gagal. Coba lagi.";
      setError(msg);
      // Unauthorized should go home per requirements
      if (err?.code === "admin/unauthorized-email") {
        navigate("/", { replace: true });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
            Admin Login
          </h1>
          <p className="text-gray-400 text-sm mt-1">Masuk menggunakan akun Google admin</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 px-3 py-2 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-2.5 transition-all"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Signing in...</span>
            </>
          ) : (
            <span>Login with Google</span>
          )}
        </button>
      </div>
    </div>
  );
}
