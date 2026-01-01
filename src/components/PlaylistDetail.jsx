// src/pages/PlaylistDetails.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ArrowLeft } from "lucide-react";
import MusicCard from "../components/MusicCard";
import { useAudio } from "../context/AudioContext";

export default function PlaylistDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { current } = useAudio();

  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlaylist();
  }, [id]);

  const fetchPlaylist = async () => {
    try {
      const { data, error } = await supabase
        .from("playlists")
        .select(`
          *,
          playlist_tracks (
            track_id,
            tracks (*)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setPlaylist(data);
    } catch (err) {
      console.error("Failed to load playlist", err);
      setPlaylist(null);
    } finally {
      setLoading(false);
    }
  };
// src/pages/PlaylistDetails.jsx
const removeFromPlaylist = async (trackId) => {
  try {
    const { error } = await supabase
      .from("playlist_tracks")
      .delete()
      .eq("playlist_id", id)      // current playlist id
      .eq("track_id", trackId);   // track to remove

    if (error) throw error;

    // Update UI instantly
    setPlaylist((prev) => ({
      ...prev,
      playlist_tracks: prev.playlist_tracks.filter(
        (pt) => pt.track_id !== trackId
      ),
    }));
  } catch (err) {
    console.error("Failed to remove track from playlist:", err.message);
  }
};

  if (loading)
    
    return <p className="p-6 text-zinc-400">Loading playlist...</p>;

  if (!playlist)
    return <p className="p-6 text-red-500">Playlist not found</p>;

  // ✅ Extract tracks ONLY
  const tracks = playlist.playlist_tracks.map(pt => pt.tracks);

  return (
    <div className="p-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-zinc-400 hover:text-gray mb-6"
      >
        <ArrowLeft size={18} />
        Back
      </button>
     <div>  
      <h1 className="text-2xl font-bold text-black mb-6">
         Your Playlist Songs</h1>
         </div>
      {/* Title */}
      <h1 className="text-2xl font-bold text-white mb-2">
        {playlist.name}
      </h1>

      <p className="text-zinc-400 mb-6">
        {tracks.length} songs
      </p>

      {/* Music Cards */}
      {tracks.length === 0 ? (
        <p className="text-zinc-400">No songs in this playlist 🎶</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
  {playlist.playlist_tracks.map((pt) => (
    <MusicCard
      key={pt.track_id}
      track={pt.tracks}
      menuMode="remove"                 // only show "Remove"
      onRemove={() => removeFromPlaylist(pt.track_id)}
      isActive={current?.id === pt.tracks.id}  // highlight currently playing
    />
  ))}
</div>

      )}
    </div>
  );
}
