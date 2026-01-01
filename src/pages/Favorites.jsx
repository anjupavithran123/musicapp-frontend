import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import MusicCard from "../components/MusicCard";

export default function Favorites({ user }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setFavorites([]);
      setLoading(false);
      return;
    }
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("favorites")
        .select(`
          id,
          track_id,
          tracks!favorites_track_id_fkey (*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setFavorites(data || []);
    } catch (err) {
      console.error("Error fetching favorites:", err);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (trackId) => {
    try {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("track_id", trackId);
  
      if (error) throw error;
  
      // Update UI instantly
      setFavorites((prev) => prev.filter((fav) => fav.track_id !== trackId));
    } catch (err) {
      console.error("Failed to remove favorite:", err.message);
    }
  };
  
  

  return (
    <div className="p-6">
      {/* ✅ Heading always visible */}
      <h1 className="text-2xl font-bold text-black mb-6">
        Your Favorite Songs
      </h1>

      {loading && <p className="text-gray-400">Loading...</p>}

      {!loading && favorites.length === 0 && (
        <p className="text-gray-400">No favorite songs yet.</p>
      )}

{!loading && favorites.length > 0 && (
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {favorites.map((fav) => (
      <MusicCard
        key={fav.id}
        track={fav.tracks}
        isFavorite
        menuMode="remove"
        onRemove={() => handleRemoveFavorite(fav.track_id)} // ✅ pass track_id
      />
    ))}
  </div>
)}

    </div>
  );
}
