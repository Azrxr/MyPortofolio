import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ImageUploader from "../components/ImageUploader";
import JsonBulkInput from "../components/JsonBulkInput";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  getAllTechStack,
  addTechStack,
  updateTechStack,
  deleteTechStack,
  addTechStacksBulk,
} from "../services/techStackService";

const TECH_STACK_EXAMPLE = [
  {
    title: "React",
    img: "https://example.com/react-logo.png",
  },
  {
    title: "Firebase",
    img: "https://example.com/firebase-logo.png",
  },
];

const INITIAL_FORM_STATE = {
  title: "",
  img: "",
};

export default function TechStackAdmin() {
  // State
  const [techStack, setTechStack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, title: "" });
  const [activeTab, setActiveTab] = useState("list"); // list | form | bulk

  // Fetch tech stack on mount
  useEffect(() => {
    fetchTechStack();
  }, []);

  async function fetchTechStack() {
    try {
      setLoading(true);
      const data = await getAllTechStack();
      setTechStack(data);
    } catch (error) {
      showMessage("Error loading tech stack: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function showMessage(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  }

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleImageUploaded(url) {
    setFormData((prev) => ({ ...prev, img: url }));
  }

  function handleEdit(tech) {
    setEditingId(tech.id);
    setFormData({
      title: tech.title || "",
      img: tech.img || "",
    });
    setActiveTab("form");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setFormData(INITIAL_FORM_STATE);
    setActiveTab("list");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const techData = {
        title: formData.title,
        img: formData.img,
      };

      if (editingId) {
        await updateTechStack(editingId, techData);
        showMessage("Tech stack updated successfully!", "success");
      } else {
        await addTechStack(techData);
        showMessage("Tech stack added successfully!", "success");
      }

      setFormData(INITIAL_FORM_STATE);
      setEditingId(null);
      setActiveTab("list");
      fetchTechStack();
    } catch (error) {
      showMessage("Error: " + error.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm.id) return;

    try {
      await deleteTechStack(deleteConfirm.id);
      showMessage("Tech stack deleted successfully!", "success");
      fetchTechStack();
    } catch (error) {
      showMessage("Error deleting tech stack: " + error.message, "error");
    } finally {
      setDeleteConfirm({ open: false, id: null, title: "" });
    }
  }

  async function handleBulkSubmit(data) {
    const result = await addTechStacksBulk(data);
    if (result.results.length > 0) {
      fetchTechStack();
    }
    return result;
  }

  return (
    <AdminLayout title="Manage Tech Stack">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "list"
              ? "bg-green-600 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          📋 View All ({techStack.length})
        </button>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData(INITIAL_FORM_STATE);
            setActiveTab("form");
          }}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "form"
              ? "bg-green-600 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          ➕ {editingId ? "Edit Tech" : "Add New"}
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "bulk"
              ? "bg-green-600 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          📦 Bulk Import
        </button>
      </div>

      {/* Message */}
      {message.text && (
        <div
          className={`mb-4 p-3 rounded-lg ${
            message.type === "error"
              ? "bg-red-500/20 border border-red-500/50 text-red-300"
              : "bg-green-500/20 border border-green-500/50 text-green-300"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* List View */}
      {activeTab === "list" && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-2 text-gray-400">Loading tech stack...</p>
            </div>
          ) : techStack.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No tech stack items found. Add your first technology!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {techStack.map((tech) => (
                <div
                  key={tech.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 text-center group"
                >
                  {/* Logo */}
                  <div className="w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden bg-black/40">
                    {tech.img ? (
                      <img
                        src={tech.img}
                        alt={tech.title}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                        No Logo
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-medium text-white truncate mb-3">
                    {tech.title}
                  </h3>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleEdit(tech)}
                      className="flex-1 px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          open: true,
                          id: tech.id,
                          title: tech.title,
                        })
                      }
                      className="flex-1 px-2 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form View */}
      {activeTab === "form" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? "Edit Tech Stack" : "Add New Tech Stack"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Technology Name *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                placeholder="e.g., React, Node.js, Python"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <ImageUploader
              onUploadSuccess={handleImageUploaded}
              folder="portfolio/tech-stack"
              label="Technology Logo"
              currentImage={formData.img}
            />

            {formData.img && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.img}
                  readOnly
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {submitting
                  ? "Saving..."
                  : editingId
                  ? "Update Tech Stack"
                  : "Add Tech Stack"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Bulk Import View */}
      {activeTab === "bulk" && (
        <JsonBulkInput
          onSubmit={handleBulkSubmit}
          exampleJson={TECH_STACK_EXAMPLE}
          title="Bulk Tech Stack JSON Import"
          placeholder="Paste your tech stack JSON array here..."
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Delete Tech Stack"
        message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null, title: "" })}
      />
    </AdminLayout>
  );
}
