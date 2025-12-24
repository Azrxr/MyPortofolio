import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  getAllComments,
  getCommentsCount,
  getVisibleCommentsCount,
  toggleCommentPin,
  toggleCommentVisibility,
  deleteComment,
} from "../services/commentService";

export default function CommentsAdmin() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [stats, setStats] = useState({ total: 0, visible: 0, hidden: 0, pinned: 0 });

  useEffect(() => {
    fetchComments();
  }, []);

  async function fetchComments() {
    setLoading(true);
    try {
      const [data, totalCount, visibleCount] = await Promise.all([
        getAllComments(),
        getCommentsCount(),
        getVisibleCommentsCount(),
      ]);
      setComments(data);
      
      const pinnedCount = data.filter(c => c.isPinned).length;
      setStats({
        total: totalCount,
        visible: visibleCount,
        hidden: totalCount - visibleCount,
        pinned: pinnedCount,
      });
    } catch (error) {
      showMessage("Error loading comments: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function showMessage(text, type) {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  }

  async function handleTogglePin(comment) {
    try {
      await toggleCommentPin(comment.id, comment.isPinned);
      showMessage(
        comment.isPinned ? "Comment unpinned!" : "Comment pinned!",
        "success"
      );
      fetchComments();
    } catch (error) {
      showMessage("Error updating pin status: " + error.message, "error");
    }
  }

  async function handleToggleVisibility(comment) {
    try {
      await toggleCommentVisibility(comment.id, comment.isHidden);
      showMessage(
        comment.isHidden ? "Comment is now visible!" : "Comment hidden!",
        "success"
      );
      fetchComments();
    } catch (error) {
      showMessage("Error updating visibility: " + error.message, "error");
    }
  }

  async function handleDelete() {
    if (!deleteConfirm.id) return;
    try {
      await deleteComment(deleteConfirm.id);
      showMessage("Comment deleted successfully!", "success");
      setDeleteConfirm({ open: false, id: null });
      fetchComments();
    } catch (error) {
      showMessage("Error deleting comment: " + error.message, "error");
    }
  }

  function formatDate(timestamp) {
    if (!timestamp) return "";
    let date;
    if (timestamp.toDate) {
      date = timestamp.toDate();
    } else if (timestamp.seconds) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  const statsCards = [
    { label: "Total Comments", value: stats.total, icon: "💬", color: "blue" },
    { label: "Visible", value: stats.visible, icon: "👁️", color: "green" },
    { label: "Hidden", value: stats.hidden, icon: "🙈", color: "yellow" },
    { label: "Pinned", value: stats.pinned, icon: "📌", color: "purple" },
  ];

  return (
    <AdminLayout title="Manage Comments">
      {/* Message */}
      {message.text && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-500/20 border border-green-500/30 text-green-300"
              : "bg-red-500/20 border border-red-500/30 text-red-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statsCards.map((stat) => (
          <div
            key={stat.label}
            className={`p-4 bg-${stat.color}-500/10 border border-${stat.color}-500/30 rounded-xl text-center`}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className={`text-2xl font-bold text-${stat.color}-300`}>
              {loading ? "-" : stat.value}
            </div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Comments List */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white">All Comments</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400">
            <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            Loading comments...
          </div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No comments yet
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 transition-colors ${
                  comment.isHidden
                    ? "bg-red-500/5 opacity-60"
                    : comment.isPinned
                    ? "bg-purple-500/10"
                    : "hover:bg-white/5"
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    {comment.profileImage ? (
                      <img
                        src={comment.profileImage}
                        alt={comment.userName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-500/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-300 text-lg font-medium">
                        {comment.userName?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">
                        {comment.userName}
                      </span>
                      {comment.isPinned && (
                        <span className="px-2 py-0.5 text-xs bg-purple-500/20 text-purple-300 rounded-full">
                          📌 Pinned
                        </span>
                      )}
                      {comment.isHidden && (
                        <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-300 rounded-full">
                          🙈 Hidden
                        </span>
                      )}
                    </div>
                    <p className="text-gray-300 text-sm mb-2 break-words">
                      {comment.content}
                    </p>
                    <span className="text-xs text-gray-500">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleTogglePin(comment)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        comment.isPinned
                          ? "bg-purple-600 hover:bg-purple-700 text-white"
                          : "bg-gray-600 hover:bg-gray-500 text-white"
                      }`}
                      title={comment.isPinned ? "Unpin" : "Pin"}
                    >
                      {comment.isPinned ? "📌 Unpin" : "📍 Pin"}
                    </button>
                    <button
                      onClick={() => handleToggleVisibility(comment)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        comment.isHidden
                          ? "bg-green-600 hover:bg-green-700 text-white"
                          : "bg-yellow-600 hover:bg-yellow-700 text-white"
                      }`}
                      title={comment.isHidden ? "Show" : "Hide"}
                    >
                      {comment.isHidden ? "👁️ Show" : "🙈 Hide"}
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({ open: true, id: comment.id })
                      }
                      className="px-3 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      title="Delete"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        onClose={() => setDeleteConfirm({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
      />
    </AdminLayout>
  );
}
