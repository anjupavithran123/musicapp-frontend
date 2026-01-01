import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../context/AudioContext";
import { supabase } from "../lib/supabase";
import { Play, Pause, MoreHorizontal } from "lucide-react";

export default function MusicCard({
  track,
  tracks = [], // ✅ FULL PLAYLIST
  onAddToPlaylist,
  onAddToFavorite,
  menuMode = "default",
  onRemove,
  isFavorite,
}) {
  const navigate = useNavigate();
  const { current, isPlaying, playTrack, pauseTrack } = useAudio();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!track) return null;

  const isCurrent = current?.id === track.id;

  const coverUrl = track.cover_path
    ? supabase.storage
        .from("cover-images")
        .getPublicUrl(track.cover_path).data.publicUrl
    : "https://via.placeholder.com/150";

  return (
    <div
      onClick={() => navigate(`/player/${track.id}`)}
      className={`
        group relative flex items-center gap-4 p-5 rounded-2xl cursor-pointer
        bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-indigo-600/20
        backdrop-blur-xl border border-white/10
        shadow-xl transition-all duration-300
        hover:scale-[1.02] hover:border-purple-400 hover:shadow-purple-500/30
        ${isCurrent ? "ring-2 ring-purple-500" : ""}
      `}
    >
      {/* Glow layer */}
      <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition" />

      {/* 🎵 Cover */}
      <img
        src={coverUrl}
        alt={track.title}
        onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
        className="relative z-10 w-16 h-16 rounded-xl object-cover shadow-lg"
      />

      {/* 🎼 Track Info */}
      <div className="relative z-10 flex-1 min-w-0">
        <h3 className="font-semibold text-white truncate">
          {track.title || "Unknown Track"}
        </h3>

        <p className="text-sm text-white/70 truncate">
          {track.artist || "Unknown Artist"}
        </p>

        {track.category && (
          <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full
                           bg-purple-500/20 text-purple-300">
            {track.category}
          </span>
        )}

        {isCurrent && isPlaying && (
          <p className="mt-1 text-xs text-purple-400 font-medium animate-pulse">
            ▶ Playing
          </p>
        )}
      </div>

      {/* ▶ Play / Pause */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          isCurrent && isPlaying ? pauseTrack() : playTrack(track, tracks);
        }}
        className="
          relative z-10 p-3 rounded-full
          bg-white/10 backdrop-blur-md
          hover:bg-purple-500/30 transition
          shadow-lg
        "
      >
        {isCurrent && isPlaying ? (
          <Pause size={20} className="text-white" />
        ) : (
          <Play size={20} className="text-white" />
        )}
      </button>

      {/* ⋮ Menu */}
      <div className="relative z-20 ml-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="p-2 rounded-full hover:bg-white/10 transition"
        >
          <MoreHorizontal size={20} className="text-white/80" />
        </button>

        {menuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="
              absolute right-0 top-12 w-48 rounded-xl overflow-hidden
              bg-zinc-900/95 backdrop-blur-xl
              border border-white/10 shadow-2xl
            "
          >
            {menuMode === "remove" ? (
              <button
                onClick={() => {
                  onRemove?.(track);
                  setMenuOpen(false);
                }}
                className="w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10"
              >
                🗑 Remove
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    onAddToFavorite?.(track);
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-purple-500/10"
                >
                  {isFavorite ? "💔 Remove Favorite" : "❤️ Add to Favorites"}
                </button>

                <button
                  onClick={() => {
                    onAddToPlaylist?.(track);
                    setMenuOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left text-white hover:bg-purple-500/10"
                >
                  ➕ Add to Playlist
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
