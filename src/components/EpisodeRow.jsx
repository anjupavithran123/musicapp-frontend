import { useAudio } from "../context/AudioContext";

export default function EpisodeRow({ episode }) {
  const { play } = useAudio();

  const handlePlay = () => {
    play({
      id: episode.id,
      title: episode.title,
      audio: episode.audio_url,
      type: "podcast"
    });
  };

  return (
    <div className="flex justify-between items-center bg-gray-50 p-3 rounded">
      <div>
        <p className="font-medium">{episode.title}</p>
        <p className="text-sm text-gray-500">
          {Math.floor(episode.duration / 60)} min
        </p>
      </div>

      <button
        onClick={handlePlay}
        className="bg-black text-white px-3 py-1 rounded"
      >
        ▶ Play
      </button>
    </div>
  );
}
