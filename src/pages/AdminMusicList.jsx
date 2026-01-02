import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function MusicList() {
  const [tracks, setTracks] = useState([]);
  const [editing, setEditing] = useState(null);
  const [deleteTrackId, setDeleteTrackId] = useState(null);

  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [category, setCategory] = useState("");

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

  const confirmDelete = async () => {
    if (!deleteTrackId) return;
    const { error } = await supabase.from("tracks").delete().eq("id", deleteTrackId);
    if (!error) fetchTracks();
    setDeleteTrackId(null);
  };

  const openEdit = (track) => {
    setEditing(track);
    setTitle(track.title);
    setArtist(track.artist);
    setCategory(track.category || "");
  };

  const uploadFile = async (file, bucketName, prefix) => {
    const ext = file.name.split(".").pop();
    const fileName = `${prefix}-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, { upsert: true });
    if (error) throw error;
    return data.path;
  };

  const saveEdit = async () => {
    let cover_path = editing.cover_path;
    let audio_path = editing.audio_path;

    if (coverFile) cover_path = await uploadFile(coverFile, "cover-images", "cover");
    if (audioFile) audio_path = await uploadFile(audioFile, "audio-files", "audio");

    const { error } = await supabase
      .from("tracks")
      .update({ title, artist, category, cover_path, audio_path })
      .eq("id", editing.id);

    if (!error) {
      setEditing(null);
      fetchTracks();
    }
  };

  const getPublicUrl = (bucket, path) =>
    path?.startsWith("http")
      ? path
      : supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-indigo-700">🎵 Admin Music List</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((t) => {
          const coverUrl =
            getPublicUrl("cover-images", t.cover_path) ||
            "https://via.placeholder.com/300";
          const audioUrl = getPublicUrl("audio-files", t.audio_path);

          return (
            <div
              key={t.id}
              className="rounded-2xl p-4 border border-indigo-200
              bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50
              hover:shadow-xl transition-all duration-300"
            >
              <img
                src={coverUrl}
                className="h-44 w-full object-cover rounded-xl"
                alt={t.title}
              />

              <div className="mt-3">
                <h3 className="font-semibold text-sm truncate text-indigo-900">{t.title}</h3>
                <p className="text-xs text-indigo-600">{t.artist}</p>
              </div>

              {audioUrl && (
                <audio controls className="w-full mt-3 h-8">
                  <source src={audioUrl} />
                </audio>
              )}

              {/* Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openEdit(t)}
                  className="flex-1 text-sm py-1.5 rounded-lg
                  bg-gradient-to-r from-indigo-600 to-purple-600
                  text-white hover:opacity-90 transition"
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteTrackId(t.id)}
                  className="flex-1 text-sm py-1.5 rounded-lg
                  bg-gradient-to-r from-red-500 to-pink-500
                  text-white hover:opacity-90 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Modal */}
     {/* Edit Modal */}
{editing && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl w-[380px] p-6 space-y-4 shadow-xl">
      <h2 className="font-semibold text-lg text-indigo-700">Edit Track</h2>

      {/* Title */}
      <input
        className="border rounded-lg p-2 w-full text-sm"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />

      {/* Artist */}
      <input
        className="border rounded-lg p-2 w-full text-sm"
        value={artist}
        onChange={(e) => setArtist(e.target.value)}
        placeholder="Artist"
      />

      {/* Category */}
      <select
        className="border rounded-lg p-2 w-full text-sm"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      >
        <option value="">Select category</option>
        <option>NewRelease</option>
        <option>Rock</option>
        <option>Evergreen</option>
        <option>Popular</option>
        <option>Classical</option>
      </select>

      {/* Cover Upload */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Change Cover</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setCoverFile(e.target.files[0])}
          className="border rounded-lg p-2 w-full text-sm"
        />
      </div>

      {/* Audio Upload */}
      <div>
        <label className="text-xs text-gray-500 mb-1 block">Change Audio</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => setAudioFile(e.target.files[0])}
          className="border rounded-lg p-2 w-full text-sm"
        />
      </div>

      <div className="flex justify-end gap-2 pt-3">
        <button
          onClick={() => setEditing(null)}
          className="px-3 py-1.5 rounded-lg border text-gray-600 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={saveEdit}
          className="px-4 py-1.5 rounded-lg
          bg-gradient-to-r from-indigo-600 to-purple-600
          text-white hover:opacity-90"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}


      {/* Delete Confirmation Modal */}
      {deleteTrackId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-[320px] p-6 space-y-4 shadow-xl text-center">
            <h2 className="text-lg font-semibold text-red-600">Delete Track?</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete this track? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => setDeleteTrackId(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
