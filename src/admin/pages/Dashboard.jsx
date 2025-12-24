import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/AdminLayout";
import { getProjectsCount } from "../services/projectService";
import { getCertificatesCount } from "../services/certificateService";
import { getTechStackCount } from "../services/techStackService";
import { getCommentsCount } from "../services/commentService";

export default function Dashboard() {
  const [counts, setCounts] = useState({
    projects: 0,
    certificates: 0,
    techStack: 0,
    comments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCounts() {
      try {
        const [projectsCount, certificatesCount, techStackCount, commentsCount] = await Promise.all([
          getProjectsCount(),
          getCertificatesCount(),
          getTechStackCount(),
          getCommentsCount(),
        ]);
        setCounts({
          projects: projectsCount,
          certificates: certificatesCount,
          techStack: techStackCount,
          comments: commentsCount,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCounts();
  }, []);

  const statsCards = [
    {
      title: "Projects",
      count: counts.projects,
      link: "/admin/projects",
      gradient: "from-blue-600/20 to-purple-600/20",
      border: "border-blue-500/30 hover:border-blue-500/50",
      textColor: "text-blue-300",
      icon: "📁",
    },
    {
      title: "Tech Stack",
      count: counts.techStack,
      link: "/admin/tech-stack",
      gradient: "from-green-600/20 to-teal-600/20",
      border: "border-green-500/30 hover:border-green-500/50",
      textColor: "text-green-300",
      icon: "⚡",
    },
    {
      title: "Certificates",
      count: counts.certificates,
      link: "/admin/certificates",
      gradient: "from-purple-600/20 to-pink-600/20",
      border: "border-purple-500/30 hover:border-purple-500/50",
      textColor: "text-purple-300",
      icon: "🏆",
    },
    {
      title: "Comments",
      count: counts.comments,
      link: "/admin/comments",
      gradient: "from-orange-600/20 to-red-600/20",
      border: "border-orange-500/30 hover:border-orange-500/50",
      textColor: "text-orange-300",
      icon: "💬",
    },
  ];

  return (
    <AdminLayout title="Dashboard Overview">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card) => (
          <Link
            key={card.title}
            to={card.link}
            className={`block p-6 bg-gradient-to-br ${card.gradient} border ${card.border} rounded-xl transition-colors`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{card.icon}</span>
              {loading ? (
                <div className="w-12 h-8 bg-white/10 animate-pulse rounded" />
              ) : (
                <span className={`text-3xl font-bold ${card.textColor}`}>
                  {card.count}
                </span>
              )}
            </div>
            <h3 className={`text-xl font-semibold ${card.textColor} mb-1`}>
              {card.title}
            </h3>
            <p className="text-gray-400 text-sm">Click to manage</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-8 p-6 bg-white/5 border border-white/10 rounded-xl">
        <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/projects"
            className="flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-lg transition-colors"
          >
            <span className="text-2xl">➕</span>
            <span className="text-blue-300">Add New Project</span>
          </Link>
          <Link
            to="/admin/certificates"
            className="flex items-center gap-3 p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg transition-colors"
          >
            <span className="text-2xl">🎓</span>
            <span className="text-purple-300">Add Certificate</span>
          </Link>
          <Link
            to="/admin/tech-stack"
            className="flex items-center gap-3 p-4 bg-green-600/20 hover:bg-green-600/30 border border-green-500/30 rounded-lg transition-colors"
          >
            <span className="text-2xl">💻</span>
            <span className="text-green-300">Add Tech Stack</span>
          </Link>
          <Link
            to="/admin/comments"
            className="flex items-center gap-3 p-4 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/30 rounded-lg transition-colors"
          >
            <span className="text-2xl">💬</span>
            <span className="text-orange-300">Manage Comments</span>
          </Link>
        </div>
      </div>

      {/* Info */}
      <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
        <h4 className="text-yellow-300 font-medium mb-2">💡 Tips</h4>
        <ul className="text-gray-300 text-sm space-y-1">
          <li>• Upload images directly to Cloudinary from each management page</li>
          <li>• Use bulk JSON import for adding multiple items at once</li>
          <li>• All data is stored in Firebase Firestore</li>
        </ul>
      </div>
    </AdminLayout>
  );
}
