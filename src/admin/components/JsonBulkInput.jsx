import React, { useState } from "react";

export default function JsonBulkInput({
  onSubmit,
  exampleJson,
  title = "Bulk JSON Input",
  placeholder = "Paste your JSON array here..."
}) {
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!jsonText.trim()) {
      setError("Please enter JSON data");
      return;
    }

    try {
      const parsedData = JSON.parse(jsonText);

      if (!Array.isArray(parsedData)) {
        setError("JSON must be an array");
        return;
      }

      if (parsedData.length === 0) {
        setError("Array cannot be empty");
        return;
      }

      setLoading(true);
      const result = await onSubmit(parsedData);

      if (result.errors && result.errors.length > 0) {
        setError(`Some items failed: ${result.errors.map(e => e.title || e.error).join(", ")}`);
      } else {
        setJsonText("");
        alert(`Successfully added ${result.results.length} items`);
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError("Invalid JSON format");
      } else {
        setError(err.message || "An error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 space-y-4">
      <h3 className="text-lg font-semibold text-white">{title}</h3>

      {exampleJson && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Example JSON format:</p>
          <pre className="bg-black/40 p-3 rounded-lg text-xs text-gray-300 overflow-x-auto">
            {JSON.stringify(exampleJson, null, 2)}
          </pre>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <textarea
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          placeholder={placeholder}
          rows={10}
          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors"
        >
          {loading ? "Processing..." : "Submit Bulk Data"}
        </button>
      </form>
    </div>
  );
}