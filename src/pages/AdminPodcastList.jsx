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

  if (loading)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500 text-lg">Loading podcasts...</p>
      </div>
    );

  if (podcasts.length === 0)
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-gray-500 text-lg">No podcasts found</p>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-indigo-700">
        🎙️ Admin Podcast List
      </h1>

      <div className="flex justify-end mb-6">
        <button
          className="bg-indigo-600 text-white px-5 py-2 rounded-lg shadow hover:shadow-lg transition"
          onClick={() => navigate("/admin/podcasts/create")}
        >
          + Create Podcast
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {podcasts.map((podcast) => (
          <div
            key={podcast.id}
            className="relative bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50
                       border border-indigo-200 rounded-2xl shadow hover:shadow-xl
                       transition overflow-hidden flex flex-col group"
          >
            {/* Podcast Cover */}
            {podcast.cover_url ? (
              <img
                src={podcast.cover_url}
                alt={podcast.title}
                className="w-full h-44 object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-full h-44 bg-gray-200 flex items-center justify-center rounded-t-2xl text-gray-400">
                No Cover
              </div>
            )}

            {/* Card Content */}
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="font-semibold text-lg text-indigo-900 truncate">
                {podcast.title}
              </h2>
              <p className="text-gray-600 mt-1 flex-1">{podcast.description}</p>

              <p className="text-sm text-gray-500 mt-2">
                Episodes: {podcast.podcast_episodes?.length || 0}
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                {/* Upload Episode */}
                <button
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-400
                             text-white px-4 py-2 rounded-xl shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-200"
                  onClick={() =>
                    navigate(
                      `/admin/podcasts/episode-upload?podcastId=${podcast.id}&title=${encodeURIComponent(
                        podcast.title
                      )}`
                    )
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Upload Episode
                </button>

                {/* View Episodes */}
                <button
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-purple-400
                             text-white px-4 py-2 rounded-xl shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-200"
                  onClick={() =>
                    navigate(`/admin/podcasts/${podcast.id}/episodes`)
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 10l4.553-2.276A2 2 0 0122 9.618v4.764a2 2 0 01-2.447 1.894L15 14M4 6h16M4 18h16"
                    />
                  </svg>
                  View Episodes
                </button>

               

                {/* Delete */}
                <button
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-400
                             text-white px-4 py-2 rounded-xl shadow-md hover:scale-105 hover:shadow-lg transition-transform duration-200"
                  onClick={() => handleDelete(podcast.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
