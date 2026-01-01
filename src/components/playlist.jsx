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

  // right-click menu state
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

  // right click handler
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
    <div className="p-6" onClick={() => setMenu(null)}>
      <h1 className="text-black text-2xl mb-4">Your Playlists</h1>

      {/* Create Playlist */}
      <div className="flex gap-2 mb-6">
        <input
          className="border p-2 rounded w-64"
          placeholder="New playlist name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={createPlaylist}
          disabled={loading}
          className="bg-purple-600 text-white px-4 rounded hover:bg-purple-700"
        >
          {loading ? "Creating..." : "Create"}
        </button>
      </div>

      {playlists.length === 0 && (
        <p className="text-zinc-400">No playlists yet</p>
      )}

      <div className="space-y-3">
        {playlists.map((pl) => (
          <div
            key={pl.id}
            onClick={() => navigate(`/playlists/${pl.id}`)}
            onContextMenu={(e) => handleRightClick(e, pl.id)}
            className="bg-zinc-900 p-4 text-white rounded-xl cursor-pointer
                       hover:border-purple-500 border border-zinc-100 w-64"
          >
            {pl.name}
          </div>
        ))}
      </div>

      {/* Right-click menu */}
      {menu && (
        <div
          className="fixed z-50 bg-white border shadow rounded"
          style={{ top: menu.y, left: menu.x }}
        >
          <button
            onClick={() => deletePlaylist(menu.id)}
            className="px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
          >
            🗑 Delete
          </button>
        </div>
      )}
    </div>
  );
}
