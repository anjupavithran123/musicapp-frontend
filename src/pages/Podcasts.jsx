import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function PodcastDetail() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPodcasts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("podcasts")
      .select(
        `
        *,
        podcast_episodes ( id )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPodcasts(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  if (loading)
    return (
      <p className="p-8 text-white/70 bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-900 min-h-screen">
        Loading podcasts...
      </p>
    );

  if (podcasts.length === 0)
    return (
      <p className="p-8 text-white/70 bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-900 min-h-screen">
        No podcasts found
      </p>
    );

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-900 text-white">
      {/* Header */}
      <h1 className="text-3xl font-extrabold mb-10 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        🎙 User Podcast List
      </h1>

      {/* Podcast Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {podcasts.map((podcast) => (
          <div
            key={podcast.id}
            className="
              group relative rounded-2xl overflow-hidden
              bg-white/10 backdrop-blur-xl
              border border-white/10
              shadow-xl transition-all duration-300
              hover:scale-[1.02] hover:border-purple-400
            "
          >
            {/* Glow */}
            <div className="absolute inset-0 bg-purple-500/20 blur-xl opacity-0 group-hover:opacity-100 transition" />

            {/* Cover */}
            {podcast.cover_url ? (
              <img
                src={podcast.cover_url}
                alt={podcast.title}
                className="relative z-10 w-full h-44 object-cover"
              />
            ) : (
              <div className="relative z-10 h-44 flex items-center justify-center bg-purple-500/20">
                🎧
              </div>
            )}

            {/* Content */}
            <div className="relative z-10 p-5">
              <h2 className="text-lg font-bold truncate">
                {podcast.title}
              </h2>

              <p className="text-sm text-white/70 mt-1 line-clamp-2">
                {podcast.description || "No description available"}
              </p>

              <p className="text-xs text-white/50 mt-2">
                Episodes: {podcast.podcast_episodes?.length || 0}
              </p>

              {/* Actions */}
              <div className="mt-4">
                <button
                  onClick={() =>
                    navigate(`/podcasts/${podcast.id}/episodes`)
                  }
                  className="
                    w-full px-4 py-2 rounded-xl font-semibold
                    bg-gradient-to-r from-purple-600 to-pink-600
                    hover:scale-105 transition shadow-lg
                  "
                >
                  View Episodes
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
