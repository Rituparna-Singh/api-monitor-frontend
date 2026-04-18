import { useEffect, useState } from "react";
import api from "../api/axios";

// Simple custom line chart using SVG
const ResponseChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const width = 600;
  const height = 180;
  const padding = 40;

  const maxVal = Math.max(...data.map((d) => d.response_time));
  const minVal = Math.min(...data.map((d) => d.response_time));
  const range = maxVal - minVal || 1;

  const points = data.map((d, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = padding + ((maxVal - d.response_time) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const polyline = points.join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-48">
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((t, i) => {
        const y = padding + t * (height - padding * 2);
        const val = Math.round(maxVal - t * range);
        return (
          <g key={i}>
            <line x1={padding} y1={y} x2={width - padding} y2={y} stroke="#374151" strokeDasharray="4" />
            <text x={padding - 5} y={y + 4} fill="#9CA3AF" fontSize="10" textAnchor="end">{val}ms</text>
          </g>
        );
      })}

      {/* Line */}
      <polyline
        points={polyline}
        fill="none"
        stroke="#3B82F6"
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Dots */}
      {points.map((p, i) => {
        const [x, y] = p.split(",");
        const isDown = !data[i].is_up;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="3"
            fill={isDown ? "#EF4444" : "#3B82F6"}
          />
        );
      })}
    </svg>
  );
};

export default function MonitorDetail({ monitor, onClose }) {
  const [checks, setChecks] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [checksRes, incidentsRes] = await Promise.all([
          api.get(`/monitors/${monitor.id}/checks`),
          api.get(`/monitors/${monitor.id}/incidents`)
        ]);
        setChecks(checksRes.data.reverse());
        setIncidents(incidentsRes.data);
      } catch (err) {
        console.error("Failed to fetch monitor details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [monitor.id]);

  const uptime = checks.length
    ? ((checks.filter((c) => c.is_up).length / checks.length) * 100).toFixed(2)
    : "N/A";

  const chartData = checks.slice(-30).map((c) => ({
    time: new Date(c.checked_at).toLocaleTimeString(),
    response_time: c.response_time_ms,
    is_up: c.is_up,
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl w-full max-w-3xl border border-gray-800 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <div>
            <h2 className="text-xl font-bold text-white">{monitor.name}</h2>
            <p className="text-gray-400 text-sm">{monitor.url}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">✕</button>
        </div>

        {loading ? (
          <div className="p-6 text-gray-400">Loading...</div>
        ) : (
          <div className="p-6 space-y-6">

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Uptime</p>
                <p className="text-green-400 text-2xl font-bold">{uptime}%</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Total Checks</p>
                <p className="text-white text-2xl font-bold">{checks.length}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-center">
                <p className="text-gray-400 text-sm mb-1">Avg Response</p>
                <p className="text-blue-400 text-2xl font-bold">
                  {checks.length
                    ? Math.round(checks.reduce((a, c) => a + c.response_time_ms, 0) / checks.length)
                    : 0}ms
                </p>
              </div>
            </div>

            {/* Chart */}
            <div>
              <h3 className="text-white font-semibold mb-3">Response Time (last 30 checks)</h3>
              {chartData.length > 0 ? (
                <div className="bg-gray-800 rounded-lg p-4">
                  <ResponseChart data={chartData} />
                  <p className="text-gray-500 text-xs mt-2">
                    🔵 Up &nbsp; 🔴 Down
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No check data yet — wait a minute for the first ping.</p>
              )}
            </div>

            {/* Incidents */}
            <div>
              <h3 className="text-white font-semibold mb-3">Incidents</h3>
              {incidents.length === 0 ? (
                <p className="text-gray-500">No incidents recorded 🎉</p>
              ) : (
                <div className="space-y-2">
                  {incidents.map((inc) => (
                    <div key={inc.id} className="bg-gray-800 rounded-lg p-3 flex justify-between items-center">
                      <div>
                        <p className="text-red-400 text-sm font-medium">
                          Down at {new Date(inc.started_at).toLocaleString()}
                        </p>
                        {inc.resolved_at && (
                          <p className="text-green-400 text-sm">
                            Resolved at {new Date(inc.resolved_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${inc.is_resolved ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>
                        {inc.is_resolved ? "Resolved" : "Ongoing"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}