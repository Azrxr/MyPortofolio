import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase/auth";
import { ADMIN_EMAILS } from "../constants/adminEmails";

export default function AdminRoute({ children }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setEmail(user?.email?.toLowerCase() || null);
      setChecking(false);
    });
    return () => unsub();
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#030014] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/80">
          <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>Checking access...</span>
        </div>
      </div>
    );
  }

  if (!email) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  if (!ADMIN_EMAILS.includes(email)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
