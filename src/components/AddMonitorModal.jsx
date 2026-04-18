import { useState } from "react";
import api from "../api/axios";

export default function AddMonitorModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: "", url: "", interval_minutes: 5 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/monitors", form);
      onAdd(res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add monitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-8 w-full max-w-md border border-gray-800">
        <h2 className="text-xl font-bold text-white mb-6">Add New Monitor</h2>
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Monitor name (e.g. Google)"
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="url"
            placeholder="URL (e.g. https://google.com)"
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            required
          />
          <select
            className="w-full p-3 rounded-lg bg-gray-800 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
            value={form.interval_minutes}
            onChange={(e) => setForm({ ...form, interval_minutes: Number(e.target.value) })}
          >
            <option value={1}>Every 1 minute</option>
            <option value={5}>Every 5 minutes</option>
            <option value={10}>Every 10 minutes</option>
            <option value={30}>Every 30 minutes</option>
          </select>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              {loading ? "Adding..." : "Add Monitor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}