import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ImageUploader from "../components/ImageUploader";
import JsonBulkInput from "../components/JsonBulkInput";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  getAllCertificates,
  addCertificate,
  updateCertificate,
  deleteCertificate,
  addCertificatesBulk,
} from "../services/certificateService";

const CERTIFICATE_EXAMPLE = [
  {
    title: "Certificate Name",
    img: "https://example.com/certificate1.jpg",
    isPinned: false
  },
  {
    title: "Another Certificate",
    img: "https://example.com/certificate2.jpg",
    isPinned: true
  },
];

// Component CertificateCard with image loading animation
function CertificateCard({ cert, onEdit, onDelete, onTogglePin }) {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group">
      {/* Image */}
      <div className="aspect-[4/3] bg-black/40 overflow-hidden relative">
        {cert.isPinned && (
          <div className="absolute top-2 right-2 z-10 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
            📌 Pinned
          </div>
        )}
        {cert.img && !imgError ? (
          <>
            {/* Loading Spinner */}
            {imgLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-5">
                <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            <img
              src={cert.img}
              alt={cert.title || "Certificate"}
              className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-300 ${imgLoading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setImgLoading(false)}
              onError={() => {
                setImgLoading(false);
                setImgError(true);
              }}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            No Image
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-3 space-y-2">
        {/* Title Display */}
        {cert.title && (
          <p className="text-white text-sm font-medium truncate mb-2">
            {cert.title}
          </p>
        )}
        <button
          onClick={() => onTogglePin(cert)}
          className={`w-full px-3 py-1.5 text-sm rounded-lg transition-colors ${
            cert.isPinned
              ? "bg-yellow-600 hover:bg-yellow-700 text-white"
              : "bg-gray-600 hover:bg-gray-500 text-white"
          }`}
        >
          {cert.isPinned ? "📌 Unpin" : "📍 Pin"}
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(cert)}
            className="flex-1 px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(cert)}
            className="flex-1 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CertificatesAdmin() {
  // State
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null });
  const [activeTab, setActiveTab] = useState("list"); // list | form | bulk

  // Fetch certificates on mount
  useEffect(() => {
    fetchCertificates();
  }, []);

  async function fetchCertificates() {
    try {
      setLoading(true);
      const data = await getAllCertificates();
      setCertificates(data);
    } catch (error) {
      showMessage("Error loading certificates: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function showMessage(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  }

  function handleImageUploaded(url) {
    setImageUrl(url);
  }

  function handleEdit(certificate) {
    setEditingId(certificate.id);
    setTitle(certificate.title || "");
    setImageUrl(certificate.img || "");
    setActiveTab("form");
  }

  function handleCancelEdit() {
    setEditingId(null);
    setTitle("");
    setImageUrl("");
    setActiveTab("list");
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!imageUrl) {
      showMessage("Please upload an image first", "error");
      return;
    }

    setSubmitting(true);
    setMessage({ text: "", type: "" });

    try {
      const certData = { 
        title: title,
        img: imageUrl,
        isPinned: false,
      };

      if (editingId) {
        // Don't override isPinned when editing
        await updateCertificate(editingId, { title: title, img: imageUrl });
        showMessage("Certificate updated successfully!", "success");
      } else {
        await addCertificate(certData);
        showMessage("Certificate added successfully!", "success");
      }

      setTitle("");
      setImageUrl("");
      setEditingId(null);
      setActiveTab("list");
      fetchCertificates();
    } catch (error) {
      showMessage("Error: " + error.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm.id) return;

    try {
      await deleteCertificate(deleteConfirm.id);
      showMessage("Certificate deleted successfully!", "success");
      fetchCertificates();
    } catch (error) {
      showMessage("Error deleting certificate: " + error.message, "error");
    } finally {
      setDeleteConfirm({ open: false, id: null });
    }
  }

  async function handleBulkSubmit(data) {
    const result = await addCertificatesBulk(data);
    if (result.results.length > 0) {
      // Force refresh the list after bulk import
      await fetchCertificates();
      // Switch to list tab to show imported certificates
      setActiveTab("list");
    }
    return result;
  }

  async function handleTogglePin(cert) {
    try {
      const newPinStatus = !cert.isPinned;
      await updateCertificate(cert.id, { isPinned: newPinStatus });
      showMessage(
        newPinStatus
          ? "Certificate pinned successfully!"
          : "Certificate unpinned successfully!",
        "success"
      );
      fetchCertificates();
    } catch (error) {
      showMessage("Error updating pin status: " + error.message, "error");
    }
  }

  return (
    <AdminLayout title="Manage Certificates">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "list"
              ? "bg-purple-600 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          📋 View All ({certificates.length})
        </button>
        <button
          onClick={() => {
            setEditingId(null);
            setImageUrl("");
            setActiveTab("form");
          }}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "form"
              ? "bg-purple-600 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          ➕ {editingId ? "Edit Certificate" : "Add New"}
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "bulk"
              ? "bg-purple-600 text-white"
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
              <div className="inline-block w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-2 text-gray-400">Loading certificates...</p>
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No certificates found. Add your first certificate!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {certificates.map((cert) => (
                <CertificateCard
                  key={cert.id}
                  cert={cert}
                  onEdit={handleEdit}
                  onDelete={(cert) => setDeleteConfirm({ open: true, id: cert.id })}
                  onTogglePin={handleTogglePin}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Form View */}
      {activeTab === "form" && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingId ? "Edit Certificate" : "Add New Certificate"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Certificate title (optional)"
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none"
              />
            </div>

            <ImageUploader
              onUploadSuccess={handleImageUploaded}
              folder="portfolio/certificates"
              label="Certificate Image *"
              currentImage={imageUrl}
            />

            {imageUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  readOnly
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting || !imageUrl}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {submitting
                  ? "Saving..."
                  : editingId
                  ? "Update Certificate"
                  : "Add Certificate"}
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
          exampleJson={CERTIFICATE_EXAMPLE}
          title="Bulk Certificates JSON Import"
          placeholder="Paste your certificates JSON array here..."
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Delete Certificate"
        message="Are you sure you want to delete this certificate? This action cannot be undone."
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null })}
      />
    </AdminLayout>
  );
}
