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

 

  if (loading) return <p className="p-4">Loading...</p>;
  if (podcasts.length === 0) return <p className="p-4">No podcasts found</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">User Podcast List</h1>

     

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
  className="bg-purple-600 text-white px-3 py-1 rounded"
  onClick={() => navigate(`/podcasts/${podcast.id}/episodes`)}
>
  View Episodes
</button>

              
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
