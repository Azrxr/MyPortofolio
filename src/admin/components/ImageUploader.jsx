import React, { useState, useRef, useEffect } from "react";
import {
  uploadToCloudinary,
  validateImageFile,
  getCloudinaryConfig,
} from "../services/cloudinaryService";

/**
 * ImageUploader Component
 * Uploads images to Cloudinary using UNSIGNED upload (no backend required)
 *
 * @param {Object} props
 * @param {Function} props.onUploadSuccess - Callback with secure_url after successful upload
 * @param {string} props.folder - Cloudinary folder path (e.g., "portfolio/projects")
 * @param {string} props.label - Optional label text
 * @param {string} props.currentImage - Optional current image URL for preview
 */
export default function ImageUploader({
  onUploadSuccess,
  folder = "portfolio/projects",
  label = "Upload Image",
  currentImage = null,
}) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(currentImage);
  const [configError, setConfigError] = useState("");
  const fileInputRef = useRef(null);

  // Check Cloudinary config on mount
  useEffect(() => {
    const config = getCloudinaryConfig();
    if (!config.configured) {
      setConfigError(
        "Cloudinary not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env"
      );
    }
  }, []);

  // Update preview when currentImage changes
  useEffect(() => {
    setPreview(currentImage);
  }, [currentImage]);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file, { maxSizeMB: 5 });
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    // Show local preview immediately
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      // Upload to Cloudinary with progress tracking (UNSIGNED)
      const secureUrl = await uploadToCloudinary(file, folder, (prog) => {
        setProgress(prog);
      });

      // Clean up local preview
      URL.revokeObjectURL(localPreview);

      // Update preview with Cloudinary URL
      setPreview(secureUrl);

      // Call success callback with secure_url
      onUploadSuccess(secureUrl);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload image");
      setPreview(currentImage); // Revert to original
      URL.revokeObjectURL(localPreview);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onUploadSuccess("");
  };

  // Show config error if Cloudinary is not configured
  if (configError) {
    return (
      <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
        <p className="text-red-400 text-sm">{configError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">{label}</label>

      {/* File Input */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {preview && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-3 py-2 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {uploading && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-blue-400">Uploading...</span>
            <span className="text-blue-400">{progress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <p className="text-sm text-red-400">{error}</p>}

      {/* Image Preview */}
      {preview && !uploading && (
        <div className="mt-3">
          <p className="text-xs text-gray-500 mb-2">Preview:</p>
          <img
            src={preview}
            alt="Upload preview"
            className="max-w-xs max-h-48 object-contain rounded-lg border border-white/10"
          />
        </div>
      )}

      {/* Folder Info */}
      <p className="text-xs text-gray-500">
        Folder: <code className="text-gray-400">{folder}</code>
      </p>
    </div>
  );
}