import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../services/adminAuth";

export default function AdminLayout({ children, title }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-white">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <nav className="w-64 flex-shrink-0">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-4">Management</h2>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/admin/dashboard"
                    className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/projects"
                    className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Projects
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/tech-stack"
                    className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Tech Stack
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/certificates"
                    className="block px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    Certificates
                  </Link>
                </li>
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              {title && <h2 className="text-2xl font-bold mb-6">{title}</h2>}
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}