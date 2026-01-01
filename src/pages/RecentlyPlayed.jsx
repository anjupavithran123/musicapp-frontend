import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import MusicCard from "../components/MusicCard";

export default function RecentlyPlayed() {
  const [tracks, setTracks] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;

    const { data } = await supabase
      .from("recently_played")
      .select("tracks(*)")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });

    setTracks(data.map((d) => d.tracks));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-white mb-4">
        Recently Played
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tracks.map((t) => (
          <MusicCard key={t.id} track={t} />
        ))}
      </div>
    </div>
  );
}
