import React, { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import ImageUploader from "../components/ImageUploader";
import JsonBulkInput from "../components/JsonBulkInput";
import ConfirmDialog from "../components/ConfirmDialog";
import {
  getAllProjects,
  addProject,
  updateProject,
  deleteProject,
  addProjectsBulk,
} from "../services/projectService";

const PROJECT_EXAMPLE = [
  {
    title: "Project A",
    description: "Description of the project",
    img: "https://example.com/image.jpg",
    link: "https://project-link.com",
    github: "https://github.com/user/repo",
    features: ["Feature 1", "Feature 2"],
    techStack: ["React", "Firebase"],
    projectType: "Personal",
    companyOrOrganization: "",
    myRole: ["Frontend Developer"],
    responsibilities: ["UI Development", "API Integration"],
    pin: false,
  },
];

const INITIAL_FORM_STATE = {
  title: "",
  description: "",
  img: "",
  link: "",
  github: "",
  features: "",
  techStack: "",
  projectType: "",
  companyOrOrganization: "",
  myRole: "",
  responsibilities: "",
  pin: false,
};

export default function ProjectsAdmin() {
  // State
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null, title: "" });
  const [activeTab, setActiveTab] = useState("list"); // list | form | bulk

  // Fetch projects on mount
  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    try {
      setLoading(true);
      const data = await getAllProjects();
      setProjects(data);
    } catch (error) {
      showMessage("Error loading projects: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function showMessage(text, type = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  }

  function handleInputChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function handleImageUploaded(url) {
    setFormData((prev) => ({ ...prev, img: url }));
  }

  function handleEdit(project) {
    setEditingId(project.id);
    setFormData({
      title: project.title || "",
      description: project.description || "",
      img: project.img || "",
      link: project.link || "",
      github: project.github || "",
      features: Array.isArray(project.features) ? project.features.join(", ") : "",
      techStack: Array.isArray(project.techStack) ? project.techStack.join(", ") : "",
      projectType: project.projectType || "",
      companyOrOrganization: project.companyOrOrganization || "",
      myRole: Array.isArray(project.myRole) ? project.myRole.join(", ") : "",
      responsibilities: Array.isArray(project.responsibilities) ? project.responsibilities.join(", ") : "",
      pin: project.pin || false,
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
      // Parse comma-separated fields into arrays
      const projectData = {
        title: formData.title,
        description: formData.description,
        img: formData.img,
        link: formData.link,
        github: formData.github,
        features: formData.features ? formData.features.split(",").map((f) => f.trim()).filter(Boolean) : [],
        techStack: formData.techStack ? formData.techStack.split(",").map((t) => t.trim()).filter(Boolean) : [],
        projectType: formData.projectType,
        companyOrOrganization: formData.companyOrOrganization,
        myRole: formData.myRole ? formData.myRole.split(",").map((r) => r.trim()).filter(Boolean) : [],
        responsibilities: formData.responsibilities ? formData.responsibilities.split(",").map((r) => r.trim()).filter(Boolean) : [],
        pin: formData.pin,
      };

      if (editingId) {
        await updateProject(editingId, projectData);
        showMessage("Project updated successfully!", "success");
      } else {
        await addProject(projectData);
        showMessage("Project added successfully!", "success");
      }

      setFormData(INITIAL_FORM_STATE);
      setEditingId(null);
      setActiveTab("list");
      fetchProjects();
    } catch (error) {
      showMessage("Error: " + error.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm.id) return;

    try {
      await deleteProject(deleteConfirm.id);
      showMessage("Project deleted successfully!", "success");
      fetchProjects();
    } catch (error) {
      showMessage("Error deleting project: " + error.message, "error");
    } finally {
      setDeleteConfirm({ open: false, id: null, title: "" });
    }
  }

  async function handleBulkSubmit(data) {
    const result = await addProjectsBulk(data);
    if (result.results.length > 0) {
      // Force refresh the list after bulk import
      await fetchProjects();
      // Switch to list tab to show imported projects
      setActiveTab("list");
    }
    return result;
  }

  async function handleTogglePin(project) {
    try {
      const newPinStatus = !project.pin;
      await updateProject(project.id, { pin: newPinStatus });
      showMessage(
        newPinStatus
          ? `"${project.title}" pinned successfully!`
          : `"${project.title}" unpinned successfully!`,
        "success"
      );
      fetchProjects();
    } catch (error) {
      showMessage("Error updating pin status: " + error.message, "error");
    }
  }

  return (
    <AdminLayout title="Manage Projects">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "list"
              ? "bg-blue-600 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          📋 View All ({projects.length})
        </button>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData(INITIAL_FORM_STATE);
            setActiveTab("form");
          }}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "form"
              ? "bg-blue-600 text-white"
              : "bg-white/10 text-gray-300 hover:bg-white/20"
          }`}
        >
          ➕ {editingId ? "Edit Project" : "Add New"}
        </button>
        <button
          onClick={() => setActiveTab("bulk")}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === "bulk"
              ? "bg-blue-600 text-white"
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
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="mt-2 text-gray-400">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No projects found. Add your first project!</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4"
                >
                  {/* Thumbnail */}
                  <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-black/40">
                    {project.img ? (
                      <img
                        src={project.img}
                        alt={project.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-white truncate">
                          {project.title}
                          {project.pin && (
                            <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded">
                              Pinned
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-400 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                    </div>

                    {/* Tech Stack Tags */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {project.techStack.slice(0, 5).map((tech, idx) => (
                          <span
                            key={idx}
                            className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.techStack.length > 5 && (
                          <span className="text-xs text-gray-500">
                            +{project.techStack.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleTogglePin(project)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        project.pin
                          ? "bg-yellow-600 hover:bg-yellow-700 text-white"
                          : "bg-gray-600 hover:bg-gray-500 text-white"
                      }`}
                      title={project.pin ? "Unpin project" : "Pin project"}
                    >
                      {project.pin ? "📌 Unpin" : "📍 Pin"}
                    </button>
                    <button
                      onClick={() => handleEdit(project)}
                      className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          open: true,
                          id: project.id,
                          title: project.title,
                        })
                      }
                      className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
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
            {editingId ? "Edit Project" : "Add New Project"}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Project Type
                </label>
                <input
                  type="text"
                  name="projectType"
                  value={formData.projectType}
                  onChange={handleInputChange}
                  placeholder="Personal, Company, etc."
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Live Demo Link
                </label>
                <input
                  type="url"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  GitHub Link
                </label>
                <input
                  type="url"
                  name="github"
                  value={formData.github}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <ImageUploader
              onUploadSuccess={handleImageUploaded}
              folder="portfolio/projects"
              label="Project Image"
              currentImage={formData.img}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Features (comma separated)
                </label>
                <input
                  type="text"
                  name="features"
                  value={formData.features}
                  onChange={handleInputChange}
                  placeholder="Feature 1, Feature 2"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  name="techStack"
                  value={formData.techStack}
                  onChange={handleInputChange}
                  placeholder="React, Firebase"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  My Role (comma separated)
                </label>
                <input
                  type="text"
                  name="myRole"
                  value={formData.myRole}
                  onChange={handleInputChange}
                  placeholder="Frontend Developer"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Responsibilities (comma separated)
                </label>
                <input
                  type="text"
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleInputChange}
                  placeholder="UI Development"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Company/Organization
              </label>
              <input
                type="text"
                name="companyOrOrganization"
                value={formData.companyOrOrganization}
                onChange={handleInputChange}
                className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="pin"
                checked={formData.pin}
                onChange={handleInputChange}
                className="mr-2 w-4 h-4"
              />
              <label className="text-sm text-gray-300">Pin this project</label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
              >
                {submitting
                  ? "Saving..."
                  : editingId
                  ? "Update Project"
                  : "Add Project"}
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
          exampleJson={PROJECT_EXAMPLE}
          title="Bulk Projects JSON Import"
          placeholder="Paste your projects JSON array here..."
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.open}
        title="Delete Project"
        message={`Are you sure you want to delete "${deleteConfirm.title}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ open: false, id: null, title: "" })}
      />
    </AdminLayout>
  );
}
