import { useState } from "react";
import api from "../api/axios";

export default function MonitorCard({ monitor, onDelete, onClick }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this monitor?")) return;
    setDeleting(true);
    try {
      await api.delete(`/monitors/${monitor.id}`);
      onDelete(monitor.id);
    } catch (err) {
      alert("Failed to delete monitor");
    } finally {
      setDeleting(false);
    }
  };

  const statusColor = monitor.is_active ? "bg-green-500" : "bg-gray-500";

  return (
    <div
      onClick={() => onClick(monitor)}
      className="bg-gray-900 border border-gray-800 rounded-xl p-5 cursor-pointer hover:border-blue-500 transition"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${statusColor} animate-pulse`} />
          <h2 className="text-white font-semibold text-lg">{monitor.name}</h2>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-red-400 hover:text-red-300 text-sm transition"
        >
          {deleting ? "Deleting..." : "Delete"}
        </button>
      </div>
      <p className="text-gray-400 text-sm truncate mb-3">{monitor.url}</p>
      <div className="flex justify-between text-sm">
        <span className="text-gray-500">Every {monitor.interval_minutes} min</span>
        <span className={monitor.is_active ? "text-green-400" : "text-gray-400"}>
          {monitor.is_active ? "Active" : "Inactive"}
        </span>
      </div>
    </div>
  );
}