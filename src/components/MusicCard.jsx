// src/components/MusicCard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../context/AudioContext";
import { supabase } from "../lib/supabase";
import { Play, Pause, MoreHorizontal } from "lucide-react";

export default function MusicCard({
  track,
  tracks = [],            // ✅ FULL PLAYLIST
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

  const formatDuration = (sec) => {
    if (!sec) return "0:00";
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={`bg-white shadow rounded-md p-4 flex items-center gap-4 cursor-pointer hover:shadow-lg transition relative
        ${isCurrent ? "border-2 border-purple-500" : ""}
      `}
      onClick={() => navigate(`/player/${track.id}`)}
    >
      {/* 🎵 Cover */}
      <img
        src={coverUrl}
        alt={track.title}
        className="w-16 h-16 object-cover rounded"
        onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
      />

      {/* 🎼 Track Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold truncate">
          {track.title || "Unknown Track"}
        </h3>
        <p className="text-sm text-gray-500 truncate">
          {track.artist || "Unknown Artist"}
        </p>

        {track.category && (
          <p className="text-xs text-gray-400">{track.category}</p>
        )}

        {track.duration && (
          <p className="text-xs text-gray-400">
            {formatDuration(track.duration)}
          </p>
        )}

        {isCurrent && isPlaying && (
          <p className="text-xs text-purple-600 font-medium mt-1">
            ▶ Playing
          </p>
        )}
      </div>

      {/* ▶ Play / Pause */}
      <button
        onClick={(e) => {
          e.stopPropagation();

          if (isCurrent && isPlaying) {
            pauseTrack();
          } else {
            playTrack(track, tracks); // ✅ PASS FULL PLAYLIST
          }
        }}
        className="p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition"
      >
        {isCurrent && isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>

      {/* ⋮ Menu */}
      <div className="relative ml-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((v) => !v);
          }}
          className="p-2 hover:bg-gray-200 rounded-full"
        >
          <MoreHorizontal size={20} />
        </button>

        {menuOpen && (
          <div
            className="absolute right-2 top-10 bg-zinc-900 border border-zinc-700 rounded-lg shadow-lg w-44 z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {menuMode === "remove" ? (
              <button
                onClick={() => {
                  onRemove?.(track);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-red-400 hover:bg-zinc-800"
              >
                Remove
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    onAddToFavorite?.(track);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-200 hover:bg-zinc-800"
                >
                  {isFavorite ? "Remove Favorite" : "Add to Favorites"}
                </button>

                <button
                  onClick={() => {
                    onAddToPlaylist?.(track);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-gray-200 hover:bg-zinc-800"
                >
                  Add to Playlist
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
