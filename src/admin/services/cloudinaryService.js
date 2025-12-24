// Cloudinary Upload Service
// Uses UNSIGNED upload - no backend required
// Configure your upload preset in Cloudinary Dashboard

// Get cloud name from environment variable
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

/**
 * Upload file to Cloudinary using UNSIGNED upload
 * No backend/API secret required - uses upload preset
 *
 * @param {File} file - The file to upload (image or PDF)
 * @param {string} folder - The Cloudinary folder path
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<string>} - The secure URL of the uploaded file
 */
export async function uploadToCloudinary(file, folder, onProgress = null) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error(
      "Cloudinary configuration missing. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in .env"
    );
  }

  // Determine resource type based on file type
  // Use 'auto' to let Cloudinary detect, or 'raw' for PDFs specifically
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const resourceType = isPdf ? "auto" : "image";

  // Prepare form data for unsigned upload
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);
  
  // For PDFs, specify resource_type in form data as well
  if (isPdf) {
    formData.append("resource_type", "auto");
  }

  // Upload URL for unsigned uploads
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  // Use XMLHttpRequest for progress tracking
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          let url = response.secure_url;
          
          // For PDFs, ensure we use /image/upload/ path
          if (isPdf && url.includes('/raw/upload/')) {
            url = url.replace('/raw/upload/', '/image/upload/');
          }
          
          resolve(url);
        } catch {
          reject(new Error("Invalid response from Cloudinary"));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error?.message || "Upload failed"));
        } catch {
          reject(new Error("Upload failed"));
        }
      }
    });

    xhr.addEventListener("error", () => {
      reject(new Error("Network error during upload"));
    });

    xhr.addEventListener("abort", () => {
      reject(new Error("Upload aborted"));
    });

    xhr.open("POST", uploadUrl);
    xhr.send(formData);
  });
}

/**
 * Validate image file before upload
 * @param {File} file - The file to validate
 * @param {Object} options - Validation options
 * @returns {Object} - { valid: boolean, error?: string }
 */
export function validateImageFile(file, options = {}) {
  const {
    maxSizeMB = 5,
    allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  } = options;

  if (!file) {
    return { valid: false, error: "No file selected" };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypes.map((t) => t.split("/")[1]).join(", ")}`,
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  return { valid: true };
}

/**
 * Get Cloudinary configuration status
 * @returns {Object} - Configuration status
 */
export function getCloudinaryConfig() {
  return {
    configured: Boolean(CLOUD_NAME && UPLOAD_PRESET),
    cloudName: CLOUD_NAME || "Not configured",
    uploadPreset: UPLOAD_PRESET ? "Configured" : "Not configured",
  };
}
