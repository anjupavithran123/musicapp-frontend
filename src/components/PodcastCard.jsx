import { Link } from "react-router-dom";

export default function PodcastCard({ podcast }) {
  return (
    <Link to={`/podcasts/${podcast.id}`}>
      <div className="bg-white shadow rounded-lg p-3 hover:shadow-lg">
        <img
          src={podcast.cover_image}
          alt={podcast.title}
          className="rounded-md mb-2 h-40 w-full object-cover"
        />
        <h3 className="font-semibold">{podcast.title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {podcast.description}
        </p>
      </div>
    </Link>
  );
}
