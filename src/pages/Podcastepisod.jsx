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
      setEpisodes(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchEpisodes();
  }, [podcastId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this episode?")) return;

    const { error } = await supabase
      .from("podcast_episodes") // ✅ correct table
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      // Remove deleted episode from UI
      setEpisodes((prev) => prev.filter((ep) => ep.id !== id));
    }
  };

  if (loading) return <p className="p-4">Loading episodes...</p>;

  return (
    <div className="p-6">
      <button className="mb-4 text-blue-600" onClick={() => navigate(-1)}>
        ← Back
      </button>

      <h1 className="text-2xl font-bold mb-4">Podcast Episodes</h1>

      {episodes.length === 0 && <p>No episodes uploaded yet.</p>}

      {episodes.map((ep) => (
        <div key={ep.id} className="border p-4 rounded mb-3">
          <h2 className="font-semibold">{ep.title}</h2>

          <p className="text-sm text-gray-500">
            Duration: {Math.floor(ep.duration / 60)}:
            {(ep.duration % 60).toString().padStart(2, "0")}
          </p>

          <audio controls src={ep.audio_url} className="w-full mt-2" />

         
        </div>
      ))}
    </div>
  );
}
