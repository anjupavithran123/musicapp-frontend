export default function PlaylistModal({ open, onClose, playlists, onSelectPlaylist, track }) {
    if (!open) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white p-6 rounded-xl w-96">
          <h2 className="text-lg font-bold mb-4">Select Playlist</h2>
          <ul>
            {playlists.map((pl) => (
              <li key={pl.id}>
                <button
                  className="w-full text-left p-2 hover:bg-gray-200 rounded"
                  onClick={() => {
                    onSelectPlaylist(track, pl);
                    onClose();
                  }}
                >
                  {pl.name}
                </button>
              </li>
            ))}
          </ul>
          <button className="mt-4 text-sm text-gray-500" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
  