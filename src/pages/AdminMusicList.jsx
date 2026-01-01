import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function MusicList() {
  const [tracks, setTracks] = useState([]);
  const [editing, setEditing] = useState(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [category, setCategory] = useState("");
  const [duration, setDuration] = useState("");

  const [coverFile, setCoverFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);

  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    const { data } = await supabase
      .from("tracks")
      .select("*")
      .order("created_at", { ascending: false });
    setTracks(data || []);
  };

  const deleteTrack = async (id) => {
    const { error } = await supabase.from("tracks").delete().eq("id", id);
    if (!error) fetchTracks();
    else alert("Failed to delete track");
  };

  const openEdit = (track) => {
    setEditing(track);
    setTitle(track.title);
    setArtist(track.artist);
    setCategory(track.category || "");
    setDuration(track.duration || "");
    setCoverFile(null);
    setAudioFile(null);
  };

  // Helper to upload file and return path
  const uploadFile = async (file, bucketName, prefix) => {
    const ext = file.name.split(".").pop();
    const fileName = `${prefix}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    return data.path; // store path in DB
  };

  const saveEdit = async () => {
    try {
      let cover_path = editing.cover_path;
      let audio_path = editing.audio_path;
      let finalDuration = duration;

      if (coverFile) cover_path = await uploadFile(coverFile, "cover-images", "cover");
      if (audioFile) {
        audio_path = await uploadFile(audioFile, "audio-files", "audio");

        // Calculate duration for new audio
        const audioEl = document.createElement("audio");
        audioEl.src = supabase.storage.from("audio-files").getPublicUrl(audio_path).data.publicUrl;
        await new Promise((resolve) => {
          audioEl.onloadedmetadata = () => {
            const mins = Math.floor(audioEl.duration / 60);
            const secs = Math.floor(audioEl.duration % 60);
            finalDuration = `${mins}:${secs.toString().padStart(2, "0")}`;
            resolve();
          };
        });
      }

      const { error } = await supabase
        .from("tracks")
        .update({ title, artist, category, duration: finalDuration, cover_path, audio_path })
        .eq("id", editing.id);

      if (!error) {
        setEditing(null);
        fetchTracks();
      } else alert("Failed to update track");
    } catch (err) {
      alert("Upload failed: " + err.message);
    }
  };

  // Helper to get public URL or fallback
  const getPublicUrl = (bucketName, pathOrUrl) => {
    if (!pathOrUrl) return null;
    // If pathOrUrl is already a full URL
    if (pathOrUrl.startsWith("http")) return pathOrUrl;
    return supabase.storage.from(bucketName).getPublicUrl(pathOrUrl).data.publicUrl;
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Admin Music List</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tracks.map((t) => {
          const coverUrl = getPublicUrl("cover-images", t.cover_path) || "https://via.placeholder.com/150";
          const audioUrl = getPublicUrl("audio-files", t.audio_path);

          return (
            <div key={t.id} className="bg-white shadow rounded p-4">
              <img
                src={coverUrl}
                className="h-40 w-full object-cover rounded"
                alt={t.title || "Cover"}
                onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
              />

              <h3 className="font-semibold mt-2">{t.title}</h3>
              <p className="text-sm text-gray-500">{t.artist}</p>
              <p className="text-xs text-gray-400">⏱ {t.duration}</p>

              {audioUrl && (
                <audio controls className="w-full mt-2">
                  <source src={audioUrl} type="audio/mpeg" />
                </audio>
              )}

              <button
                onClick={() => openEdit(t)}
                className="mt-3 w-full bg-blue-600 text-white py-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteTrack(t.id)}
                className="mt-1 w-full bg-red-600 text-white py-1 rounded"
              >
                Delete
              </button>
            </div>
          );
        })}
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96 space-y-3">
            <h2 className="font-semibold">Edit Track</h2>

            <input
              className="border p-2 w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
            <input
              className="border p-2 w-full"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist"
            />
            <select
  className="border p-2 w-full"
  value={category}
  onChange={(e) => setCategory(e.target.value)}
>
  <option value="">Select category</option>
  <option value="NewRelease">New Release</option>
  <option value="Rock">Rock</option>
  <option value="Evergreen">Evergreen</option>
  <option value="Popular">Popular</option>
  <option value="Classical">Classical</option>
</select>

            <input
              className="border p-2 w-full"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Duration (mm:ss)"
            />

            <label className="text-sm">Change Cover</label>
            <input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files[0])} />

            <label className="text-sm">Change Audio</label>
            <input type="file" accept="audio/*" onChange={(e) => setAudioFile(e.target.files[0])} />

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(null)}>Cancel</button>
              <button onClick={saveEdit} className="bg-indigo-600 text-white px-4 py-2 rounded">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
