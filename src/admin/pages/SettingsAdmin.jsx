import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ImageUploader from "../components/ImageUploader";
import {
  getSettings,
  updateSettings,
  uploadCV,
  uploadProfileImage,
  calculateYearsOfExperience,
} from "../services/settingsService";

export default function SettingsAdmin() {
  const [settings, setSettings] = useState({
    name: "",
    title: "",
    bio: "",
    experienceStartDate: "",
    cvUrlId: "",
    cvFileNameId: "",
    cvUrlEn: "",
    cvFileNameEn: "",
    github: "",
    linkedin: "",
    instagram: "",
    email: "",
    profileImage: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [cvUploadingId, setCvUploadingId] = useState(false);
  const [cvProgressId, setCvProgressId] = useState(0);
  const [cvUploadingEn, setCvUploadingEn] = useState(false);
  const [cvProgressEn, setCvProgressEn] = useState(0);
  const [previewCv, setPreviewCv] = useState({ open: false, url: "", title: "" });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setLoading(true);
    try {
      const data = await getSettings();
      setSettings(data);
    } catch (error) {
      showMessage("Error loading settings: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function showMessage(text, type) {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 4000);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings({
        name: settings.name,
        title: settings.title,
        bio: settings.bio,
        experienceStartDate: settings.experienceStartDate,
        github: settings.github,
        linkedin: settings.linkedin,
        instagram: settings.instagram,
        email: settings.email,
      });
      showMessage("Settings saved successfully!", "success");
    } catch (error) {
      showMessage("Error saving settings: " + error.message, "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleCVUpload(e, lang) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type - only PDF for preview
    if (file.type !== "application/pdf") {
      showMessage("Please upload a PDF file for CV", "error");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      showMessage("File size must be less than 10MB", "error");
      return;
    }

    if (lang === 'id') {
      setCvUploadingId(true);
      setCvProgressId(0);
    } else {
      setCvUploadingEn(true);
      setCvProgressEn(0);
    }

    try {
      const url = await uploadCV(file, lang, (progress) => {
        if (lang === 'id') {
          setCvProgressId(progress);
        } else {
          setCvProgressEn(progress);
        }
      });
      
      if (lang === 'id') {
        setSettings((prev) => ({
          ...prev,
          cvUrlId: url,
          cvFileNameId: file.name,
        }));
      } else {
        setSettings((prev) => ({
          ...prev,
          cvUrlEn: url,
          cvFileNameEn: file.name,
        }));
      }
      
      showMessage(`CV (${lang === 'id' ? 'Indonesia' : 'English'}) uploaded successfully!`, "success");
    } catch (error) {
      showMessage("Error uploading CV: " + error.message, "error");
    } finally {
      if (lang === 'id') {
        setCvUploadingId(false);
        setCvProgressId(0);
      } else {
        setCvUploadingEn(false);
        setCvProgressEn(0);
      }
    }
  }

  function openCvPreview(url, title) {
    setPreviewCv({ open: true, url, title });
  }

  function closeCvPreview() {
    setPreviewCv({ open: false, url: "", title: "" });
  }

  function handleProfileImageChange(url) {
    setSettings((prev) => ({ ...prev, profileImage: url }));
  }

  const yearsExperience = calculateYearsOfExperience(settings.experienceStartDate);

  if (loading) {
    return (
      <AdminLayout title="Portfolio Settings">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full"></div>
          <span className="ml-3 text-gray-400">Loading settings...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Portfolio Settings">
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            👤 Personal Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={settings.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Job Title
              </label>
              <input
                type="text"
                name="title"
                value={settings.title}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                placeholder="e.g., Mobile & Backend Developer"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio / About Me
            </label>
            <textarea
              name="bio"
              value={settings.bio}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none resize-none"
              placeholder="Write a short bio..."
            />
          </div>
        </div>

        {/* Experience */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            ⏱️ Experience
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Experience Start Date
              </label>
              <input
                type="date"
                name="experienceStartDate"
                value={settings.experienceStartDate}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="text-3xl font-bold text-purple-300">
                {yearsExperience} Years
              </div>
              <div className="text-sm text-gray-400">of Experience</div>
            </div>
          </div>
        </div>

        {/* CV Upload */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">📄 CV / Resume</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* CV Indonesia */}
            <div className="space-y-4 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <img src="/flag_id.png" alt="Indonesia" className="w-8 h-6 object-cover rounded" />
                <h4 className="font-medium text-white">CV Bahasa Indonesia</h4>
              </div>
              
              {settings.cvUrlId && (
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <span className="text-xl">📄</span>
                  <div className="flex-grow min-w-0">
                    <p className="text-green-300 font-medium text-sm truncate">
                      {settings.cvFileNameId || "CV Uploaded"}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => openCvPreview(settings.cvUrlId, "CV Indonesia")}
                        className="text-xs text-purple-400 hover:text-purple-300 underline"
                      >
                        Preview
                      </button>
                      <a
                        href={settings.cvUrlId}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-white underline"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <label className="block">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleCVUpload(e, 'id')}
                  className="hidden"
                  disabled={cvUploadingId}
                />
                <div
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-red-500/50 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-500/10 transition-colors ${
                    cvUploadingId ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {cvUploadingId ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full"></div>
                      <span className="text-red-300">Uploading... {cvProgressId}%</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">📤</span>
                      <span className="text-red-300">
                        {settings.cvUrlId ? "Ganti CV" : "Upload CV"}
                      </span>
                    </>
                  )}
                </div>
              </label>
            </div>

            {/* CV English */}
            <div className="space-y-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <img src="/flag_en.png" alt="English" className="w-8 h-6 object-cover rounded" />
                <h4 className="font-medium text-white">CV English</h4>
              </div>
              
              {settings.cvUrlEn && (
                <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <span className="text-xl">📄</span>
                  <div className="flex-grow min-w-0">
                    <p className="text-green-300 font-medium text-sm truncate">
                      {settings.cvFileNameEn || "CV Uploaded"}
                    </p>
                    <div className="flex gap-2 mt-1">
                      <button
                        type="button"
                        onClick={() => openCvPreview(settings.cvUrlEn, "CV English")}
                        className="text-xs text-purple-400 hover:text-purple-300 underline"
                      >
                        Preview
                      </button>
                      <a
                        href={settings.cvUrlEn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-400 hover:text-white underline"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              )}

              <label className="block">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleCVUpload(e, 'en')}
                  className="hidden"
                  disabled={cvUploadingEn}
                />
                <div
                  className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-500/50 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-500/10 transition-colors ${
                    cvUploadingEn ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {cvUploadingEn ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                      <span className="text-blue-300">Uploading... {cvProgressEn}%</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl">📤</span>
                      <span className="text-blue-300">
                        {settings.cvUrlEn ? "Replace CV" : "Upload CV"}
                      </span>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            Format: PDF only (max 10MB) - PDF required for preview feature
          </p>
        </div>

        {/* Profile Image */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            🖼️ Profile Image
          </h3>
          <div className="flex items-start gap-6">
            {settings.profileImage && (
              <div className="flex-shrink-0">
                <img
                  src={settings.profileImage}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-purple-500/30"
                />
              </div>
            )}
            <div className="flex-grow">
              <ImageUploader
                currentImage={settings.profileImage}
                onImageChange={handleProfileImageChange}
                folder="portfolio/profile"
                label="Upload new profile image"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            🔗 Social Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                GitHub
              </label>
              <input
                type="url"
                name="github"
                value={settings.github}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                placeholder="https://github.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                name="linkedin"
                value={settings.linkedin}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                placeholder="https://linkedin.com/in/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instagram
              </label>
              <input
                type="url"
                name="instagram"
                value={settings.instagram}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={settings.email}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-black/40 border border-white/20 rounded-lg text-white focus:border-purple-500 focus:outline-none"
                placeholder="your@email.com"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className={`px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all ${
              saving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Saving...
              </span>
            ) : (
              "💾 Save Settings"
            )}
          </button>
        </div>
      </form>

      {/* CV Preview Modal */}
      {previewCv.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl h-[90vh] mx-4 bg-gray-900 rounded-xl overflow-hidden border border-white/20">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-lg font-semibold text-white">{previewCv.title}</h3>
              <div className="flex items-center gap-3">
                <a
                  href={previewCv.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                >
                  Download
                </a>
                <button
                  onClick={closeCvPreview}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white"
                >
                  ✕
                </button>
              </div>
            </div>
            <iframe
              src={`${previewCv.url}#toolbar=0`}
              className="w-full h-[calc(100%-60px)]"
              title="CV Preview"
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
