import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

export default function Playlists() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [playlists, setPlaylists] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Right-click menu state
  const [menu, setMenu] = useState(null); // { x, y, id }

  useEffect(() => {
    if (!user) return;
    fetchPlaylists();
  }, [user]);

  const fetchPlaylists = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/playlists?user_id=${user.id}`
      );
      setPlaylists(res.data || []);
    } catch (err) {
      console.error("Failed to fetch playlists", err);
      setPlaylists([]);
    }
  };

  const createPlaylist = async () => {
    if (!name.trim()) return alert("Playlist name required");

    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/playlists`, {
        name,
        user_id: user.id,
      });
      setName("");
      fetchPlaylists();
    } catch (err) {
      alert("Failed to create playlist");
    } finally {
      setLoading(false);
    }
  };

  // Right-click handler
  const handleRightClick = (e, id) => {
    e.preventDefault();
    setMenu({ x: e.pageX, y: e.pageY, id });
  };

  const deletePlaylist = async (id) => {
    const ok = window.confirm("Delete this playlist?");
    if (!ok) return;

    try {
      await axios.delete(`${API_URL}/api/${id}`);
      setPlaylists((prev) => prev.filter((p) => p.id !== id));
      setMenu(null);
    } catch (err) {
      alert("Failed to delete playlist");
    }
  };

  return (
    <div
      className="relative min-h-screen p-8 bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-900 text-white"
      onClick={() => setMenu(null)}
    >
      {/* Title */}
      <h1 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        🎵 Your Playlists
      </h1>

      {/* Create Playlist */}
      <div className="flex flex-wrap gap-4 mb-12">
        <input
          className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-xl w-72 text-white placeholder-white/60
                     focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="New playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={createPlaylist}
          disabled={loading}
          className="px-7 py-3 rounded-xl font-semibold
                     bg-gradient-to-r from-purple-600 to-pink-600
                     hover:scale-105 transition shadow-lg disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>

      {/* Empty State */}
      {playlists.length === 0 && (
        <p className="text-white/50">No playlists yet</p>
      )}

      {/* Playlist Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {playlists.map((pl) => (
          <div
            key={pl.id}
            onClick={() => navigate(`/playlists/${pl.id}`)}
            onContextMenu={(e) => handleRightClick(e, pl.id)}
            className="
              group relative cursor-pointer rounded-2xl p-6
              bg-gradient-to-br from-purple-600/30 via-pink-500/20 to-indigo-500/30
              backdrop-blur-xl border border-white/20
              hover:border-purple-400 hover:scale-105
              transition-all duration-300 shadow-xl
            "
          >
            {/* Glow layer */}
            <div className="absolute inset-0 rounded-2xl bg-purple-500/30 blur-xl opacity-0 group-hover:opacity-100 transition" />

            {/* Card content */}
            <div className="relative z-10">
              <div className="text-4xl mb-3">🎧</div>
              <h2 className="text-lg font-bold truncate">{pl.name}</h2>
              <p className="text-sm text-white/60 mt-1">
                Click to open playlist
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Right-click menu */}
      {menu && (
        <div
          className="fixed z-50 bg-zinc-900 border border-white/20 rounded-xl shadow-xl overflow-hidden"
          style={{ top: menu.y, left: menu.x }}
        >
          <button
            onClick={() => deletePlaylist(menu.id)}
            className="px-5 py-3 text-red-400 hover:bg-red-500/10 w-full text-left"
          >
            🗑 Delete Playlist
          </button>
        </div>
      )}
    </div>
  );
}
