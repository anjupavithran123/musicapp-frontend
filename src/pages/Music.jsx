import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import MusicCard from "../components/MusicCard";
import PlaylistModal from "../components/playlistdemo";
import SearchBar from "../components/SearchBar";

export default function Music() {
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const categories = [
    "All",
    "NewRelease",
    "Classical",
    "Rock",
    "Popular",
    "Evergreen",
  ];
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    fetchTracks();
    fetchPlaylists();
  }, []);

  const fetchTracks = async () => {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .not("audio_path", "is", null)
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setTracks(data || []);
    setLoading(false);
  };

  const fetchPlaylists = async () => {
    const { data, error } = await supabase
      .from("playlists")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setPlaylists(data || []);
  };

  const handleAddToPlaylist = (track) => {
    setSelectedTrack(track);
    setModalOpen(true);
  };

  const handleSelectPlaylist = async (track, playlist) => {
    try {
      const { data: existing, error } = await supabase
        .from("playlist_tracks")
        .select("*")
        .eq("playlist_id", playlist.id)
        .eq("track_id", track.id);

      if (error) throw error;
      if (existing.length > 0)
        return alert(`${track.title} is already in ${playlist.name}`);

      const { error: insertError } = await supabase
        .from("playlist_tracks")
        .insert([{ playlist_id: playlist.id, track_id: track.id }]);

      if (insertError) throw insertError;
      fetchPlaylists();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddToFavorite = async (track) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return alert("Login required");

      const { data: existing } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id)
        .eq("track_id", track.id);

      if (existing.length > 0) return alert("Already in favorites");

      await supabase
        .from("favorites")
        .insert([{ user_id: user.id, track_id: track.id }]);
      alert("Added to favorites ❤️");
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTracks = (searching ? searchResults : tracks).filter(
    (track) =>
      activeCategory === "All" ||
      track.category?.toLowerCase() === activeCategory.toLowerCase()
  );

  if (loading)
    return <p className="p-6 text-white">Loading music...</p>;

  if (tracks.length === 0)
    return <p className="p-6 text-white">No music uploaded.</p>;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-900 text-white">
      {/* 🎶 Header */}
      <h1 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        🎶 Explore Music
      </h1>

      {/* Categories + Search */}
      <div className="flex items-center gap-4 mb-10 overflow-x-auto scrollbar-hide">
        {/* Category pills */}
        <div className="flex gap-3 flex-shrink-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300
                ${
                  activeCategory === cat
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-105 shadow-lg shadow-purple-500/40"
                    : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="ml-auto w-72 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-2 shadow-lg">
          <SearchBar
            type="track"
            onResults={(results) => {
              setSearchResults(results);
              setSearching(
                results.length > 0 ||
                  (results.length === 0 && searchResults.length > 0)
              );
            }}
          />
        </div>
      </div>

      {/* 🎧 Music Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {filteredTracks.map((track) => (
          <MusicCard
            key={track.id}
            track={track}
            tracks={tracks}
            onAddToPlaylist={handleAddToPlaylist}
            onAddToFavorite={handleAddToFavorite}
          />
        ))}
      </div>

      {/* 📌 Playlist Modal */}
      <PlaylistModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        playlists={playlists}
        onSelectPlaylist={handleSelectPlaylist}
        track={selectedTrack}
      />
    </div>
  );
}
