import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useAudio } from "../context/AudioContext";
import { supabase } from "../lib/supabase";
import { Play, Pause, MoreHorizontal } from "lucide-react";

export default function MusicCard({
  track,
  tracks = [],
  onAddToPlaylist,
  onAddToFavorite,
  menuMode = "default",
  onRemove,
  isFavorite,
}) {
  const navigate = useNavigate();
  const { current, isPlaying, playTrack, pauseTrack, setPlaybackRate } =
    useAudio();

  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });

  const buttonRef = useRef(null);
  const menuRef = useRef(null);

  if (!track) return null;

  const isCurrent = current?.id === track.id;

  /* COVER */
  const coverUrl = track.cover_path
    ? supabase.storage
        .from("cover-images")
        .getPublicUrl(track.cover_path).data.publicUrl
    : "https://via.placeholder.com/150";

  /* AUDIO */
  const audioUrl = track.audio_path
    ? supabase.storage
        .from("audio-files")
        .getPublicUrl(track.audio_path).data.publicUrl
    : null;

  /* CLOSE MENU ON OUTSIDE CLICK */
  useEffect(() => {
    const handler = (e) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* OPEN MENU WITH POSITION */
  const openMenu = (e) => {
    e.stopPropagation();
    const rect = buttonRef.current.getBoundingClientRect();

    setMenuPos({
      top: rect.bottom + 8,
      left: rect.right - 210,
    });

    setMenuOpen(true);
  };

  return (
    <>
      {/* 🎵 CARD */}
      <div
        onClick={() => {
          setMenuOpen(false);
          navigate(`/player/${track.id}`);
        }}
        className={`
          group relative flex items-center gap-4 p-5 rounded-2xl cursor-pointer
          bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-indigo-600/20
          backdrop-blur-xl border border-white/10
          shadow-xl transition-all duration-300
          hover:scale-[1.02]
          ${isCurrent ? "ring-2 ring-purple-500" : ""}
        `}
      >
        <img
          src={coverUrl}
          alt={track.title}
          className="w-16 h-16 rounded-xl object-cover"
        />

        <div className="flex-1 min-w-0">
          <h3 className="text-white truncate font-semibold">
            {track.title}
          </h3>
          <p className="text-white/70 text-sm truncate">
            {track.artist}
          </p>
        </div>

        {/* ▶ PLAY */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            isCurrent && isPlaying
              ? pauseTrack()
              : playTrack(track, tracks);
          }}
          className="p-3 rounded-full bg-white/10"
        >
          {isCurrent && isPlaying ? (
            <Pause size={20} className="text-white" />
          ) : (
            <Play size={20} className="text-white" />
          )}
        </button>

        {/* ⋮ MENU BUTTON */}
        <button
          ref={buttonRef}
          onClick={openMenu}
          className="p-2 rounded-full hover:bg-white/10"
        >
          <MoreHorizontal size={20} className="text-white/80" />
        </button>
      </div>

      {/* 🧾 PORTAL MENU */}
      {menuOpen &&
        createPortal(
          <div
            ref={menuRef}
            style={{ top: menuPos.top, left: menuPos.left }}
            className="
              fixed z-[100000]
              w-52 rounded-xl overflow-hidden
              bg-zinc-900/95 backdrop-blur-xl
              border border-white/10 shadow-2xl
            "
          >
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

            {audioUrl && (
              <a
                href={audioUrl}
                download
                className="block px-4 py-3 text-white hover:bg-purple-500/10"
              >
                ⬇ Download
              </a>
            )}

           
          </div>,
          document.body
        )}
    </>
  );
}
