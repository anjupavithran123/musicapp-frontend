import { useAudio } from "../context/AudioContext";

export default function EpisodeCard({ episode }) {
  const { play } = useAudio();

  return (
    <div className="p-3 border rounded flex justify-between">
      <p>{episode.title}</p>
      <button onClick={() => play(episode)}>▶</button>
    </div>
  );
}
