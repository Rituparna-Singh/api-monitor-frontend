import { useEffect, useState } from "react";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import MonitorCard from "../components/MonitorCard";
import AddMonitorModal from "../components/AddMonitorModal";
import MonitorDetail from "../components/MonitorDetail";

export default function Dashboard() {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMonitor, setSelectedMonitor] = useState(null);

  useEffect(() => {
    const fetchMonitors = async () => {
      try {
        const res = await api.get("/monitors");
        setMonitors(res.data);
      } catch (err) {
        console.error("Failed to fetch monitors");
      } finally {
        setLoading(false);
      }
    };
    fetchMonitors();
  }, []);

  const handleAdd = (monitor) => setMonitors([monitor, ...monitors]);
  const handleDelete = (id) => setMonitors(monitors.filter((m) => m.id !== id));

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Your Monitors</h2>
            <p className="text-gray-400 mt-1">{monitors.length} monitor{monitors.length !== 1 ? "s" : ""} active</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold transition"
          >
            + Add Monitor
          </button>
        </div>

        {/* Monitors Grid */}
        {loading ? (
          <p className="text-gray-400">Loading monitors...</p>
        ) : monitors.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg mb-4">No monitors yet</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              Add your first monitor
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monitors.map((monitor) => (
              <MonitorCard
                key={monitor.id}
                monitor={monitor}
                onDelete={handleDelete}
                onClick={setSelectedMonitor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddMonitorModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAdd}
        />
      )}
      {selectedMonitor && (
        <MonitorDetail
          monitor={selectedMonitor}
          onClose={() => setSelectedMonitor(null)}
        />
      )}
    </div>
  );
}