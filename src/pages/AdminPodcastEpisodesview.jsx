import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AdminPodcastEpisodesView() {
  const { podcastId } = useParams();
  const navigate = useNavigate();
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchEpisodes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("podcast_episodes")
      .select("*")
      .eq("podcast_id", podcastId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      alert("Failed to load episodes");
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
      .from("podcast_episodes")
      .delete()
      .eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      setEpisodes((prev) => prev.filter((ep) => ep.id !== id));
    }
  };

  if (loading)
    return <p className="p-4 text-gray-600 font-semibold">Loading episodes...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        className="flex items-center gap-2 text-indigo-600 font-semibold mb-4 hover:text-indigo-800 transition"
        onClick={() => navigate(-1)}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-3xl font-bold mb-6 text-indigo-700">Podcast Episodes</h1>

      {episodes.length === 0 && (
        <p className="text-gray-600">No episodes uploaded yet.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {episodes.map((ep) => (
          <div
            key={ep.id}
            className="bg-white rounded-2xl shadow-md p-4 flex flex-col justify-between hover:shadow-lg transition"
          >
            <div>
              <h2 className="font-semibold text-lg text-indigo-900 truncate">{ep.title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                Duration: {Math.floor(ep.duration / 60)}:
                {(ep.duration % 60).toString().padStart(2, "0")}
              </p>

              <audio controls src={ep.audio_url} className="w-full mt-3 rounded" />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 flex-wrap">
              <button
                onClick={() =>
                  navigate(`/admin/podcasts/edit/${podcastId}`)

                }
                className="flex-1 text-sm py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:opacity-90 transition"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(ep.id)}
                className="flex-1 text-sm py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white hover:opacity-90 transition"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
