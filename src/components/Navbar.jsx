import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-white">API Monitor</h1>
      <div className="flex items-center gap-4">
        <span className="text-gray-400 text-sm">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}