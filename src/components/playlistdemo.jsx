export default function PlaylistModal({
  open,
  onClose,
  playlists,
  onSelectPlaylist,
  track,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Small card */}
      <div
        className="
          pointer-events-auto
          fixed
          top-1/2 left-1/2
          -translate-x-1/2 -translate-y-1/2
          w-64
          rounded-xl
          bg-white
          shadow-2xl
          border border-gray-200
          p-3
        "
      >
        <h2 className="text-sm font-semibold text-gray-800 mb-2">
          Select Playlist
        </h2>

        {playlists?.length === 0 ? (
          <p className="text-xs text-gray-500">No playlists found</p>
        ) : (
          <ul className="max-h-48 overflow-y-auto space-y-1">
            {playlists.map((pl) => (
              <li key={pl.id}>
                <button
                  onClick={() => {
                    onSelectPlaylist(track, pl);
                    onClose();
                  }}
                  className="
                    w-full text-left
                    px-3 py-2
                    rounded-lg
                    text-sm text-gray-800
                    hover:bg-gray-100
                    transition
                  "
                >
                  🎵 {pl.name}
                </button>
              </li>
            ))}
          </ul>
        )}

        <button
          onClick={onClose}
          className="
            mt-2 w-full
            text-xs text-gray-500
            hover:text-gray-700
          "
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
