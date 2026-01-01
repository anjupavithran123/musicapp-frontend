import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function UserPodcastEpisodesview() {
  const { podcastId } = useParams();
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEpisodes = async () => {
    const { data, error } = await supabase
      .from("podcast_episodes")
      .select("*")
      .eq("podcast_id", podcastId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setEpisodes(data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEpisodes();
  }, [podcastId]);

  if (loading) {
    return (
      <div className="min-h-screen p-8 bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-900 text-white/70">
        Loading episodes...
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-zinc-950 via-purple-950 to-zinc-900 text-white">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition"
      >
        ← Back
      </button>

      {/* Heading */}
      <h1 className="text-3xl font-extrabold mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        🎧 Podcast Episodes
      </h1>

      {episodes.length === 0 && (
        <p className="text-white/60">No episodes uploaded yet.</p>
      )}

      {/* Episodes List */}
      <div className="space-y-6">
        {episodes.map((ep) => (
          <div
            key={ep.id}
            className="
              relative rounded-2xl p-5
              bg-white/10 backdrop-blur-xl
              border border-white/10
              shadow-xl transition
              hover:border-purple-400
            "
          >
            {/* Glow */}
            <div className="absolute inset-0 rounded-2xl bg-purple-500/20 blur-xl opacity-0 hover:opacity-100 transition" />

            <div className="relative z-10">
              {/* Title */}
              <h2 className="text-lg font-bold truncate">
                {ep.title}
              </h2>

              {/* Duration */}
              <p className="text-sm text-white/60 mt-1">
                ⏱ Duration: {Math.floor(ep.duration / 60)}:
                {(ep.duration % 60).toString().padStart(2, "0")}
              </p>

              {/* Audio Player */}
              <audio
                controls
                src={ep.audio_url}
                className="w-full mt-4 rounded-lg"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
