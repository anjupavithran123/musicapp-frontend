import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AdminPodcastList() {
  const [podcasts, setPodcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPodcasts = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("podcasts")
      .select(`
        *,
        podcast_episodes ( id )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setPodcasts(data);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPodcasts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this podcast?")) return;

    const { error } = await supabase
      .from("podcasts")
      .delete()
      .eq("id", id);

    if (error) alert(error.message);
    else fetchPodcasts();
  };

  if (loading) return <p className="p-4">Loading...</p>;
  if (podcasts.length === 0) return <p className="p-4">No podcasts found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Podcast List</h1>

      <div className="flex justify-end mb-4">
        <button
          className="bg-black text-white px-4 py-2 rounded"
          onClick={() => navigate("/admin/podcasts/create")}
        >
          Create Podcast
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {podcasts.map((podcast) => (
          <div key={podcast.id} className="border p-4 rounded shadow">
            {podcast.cover_url && (
              <img
                src={podcast.cover_url}
                alt={podcast.title}
                className="w-full h-40 object-cover rounded mb-2"
              />
            )}

            <h2 className="font-semibold text-lg">{podcast.title}</h2>
            <p className="text-gray-600">{podcast.description}</p>

            <p className="text-sm text-gray-500 mt-1">
              Episodes: {podcast.podcast_episodes?.length || 0}
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              <button
                className="bg-blue-600 text-white px-3 py-1 rounded"
                onClick={() =>
                  navigate(
                    `/admin/podcasts/episode-upload?podcastId=${podcast.id}&title=${encodeURIComponent(
                      podcast.title
                    )}`
                  )
                }
              >
                Upload Episode
              </button>

              <button
                className="bg-purple-600 text-white px-3 py-1 rounded"
                onClick={() =>
                  navigate(`/admin/podcasts/${podcast.id}/episodes`)
                }
              >
                View Episodes
              </button>

              <button
                className="bg-green-600 text-white px-3 py-1 rounded"
                onClick={() =>
                  navigate(`/admin/podcasts/edit/${podcast.id}`)
                }
              >
                Edit
              </button>

              <button
                className="bg-red-600 text-white px-3 py-1 rounded"
                onClick={() => handleDelete(podcast.id)}
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
