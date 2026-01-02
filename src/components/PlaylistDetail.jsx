import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { ArrowLeft, Music } from "lucide-react";
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

  const removeFromPlaylist = async (trackId) => {
    try {
      const { error } = await supabase
        .from("playlist_tracks")
        .delete()
        .eq("playlist_id", id)
        .eq("track_id", trackId);

      if (error) throw error;

      setPlaylist((prev) => ({
        ...prev,
        playlist_tracks: prev.playlist_tracks.filter(
          (pt) => pt.track_id !== trackId
        ),
      }));
    } catch (err) {
      console.error("Failed to remove track:", err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Loading playlist...
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-red-500">
        Playlist not found
      </div>
    );
  }

  const tracks = playlist.playlist_tracks.map((pt) => pt.tracks);

  return (
    <div className="min-h-screen bg-zinc-950 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition mb-6"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        {/* Playlist Header */}
        <div className="relative overflow-hidden rounded-lg 
  bg-gradient-to-br from-purple-600 via-pink-500 to-indigo-600
  p-3 mb-5 shadow-md
  max-w-md"
>
  <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />

  <div className="relative z-10 flex items-center gap-3">
    <div className="p-1 bg-white/20 rounded-md">
      <Music className="text-white" size={18} />
    </div>

    <div className="truncate">
      <h1 className="text-sm font-semibold text-white truncate">
        {playlist.name}
      </h1>
      <p className="text-[11px] text-white/80">
        {tracks.length} songs
      </p>
    </div>
  </div>
</div>


        {/* Songs Section */}
        {tracks.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-zinc-400 py-20">
            <Music size={40} className="mb-4 opacity-60" />
            <p className="text-lg">No songs in this playlist</p>
            <p className="text-sm opacity-70">Add some music 🎶</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {playlist.playlist_tracks.map((pt) => (
              <div
                key={pt.track_id}
                className={`bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg p-3
                  hover:-translate-y-1 transition-all duration-300
                  ${
                    current?.id === pt.tracks.id
                      ? "ring-2 ring-purple-500"
                      : ""
                  }
                `}
              >
                <MusicCard
                  track={pt.tracks}
                  menuMode="remove"
                  onRemove={() => removeFromPlaylist(pt.track_id)}
                  isActive={current?.id === pt.tracks.id}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
