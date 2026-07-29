import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <h1 className="text-6xl font-extrabold text-primary-600 mb-4">404</h1>
      <h2 className="text-xl font-bold mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-medium">
        Back to Home
      </Link>
    </div>
  );
}
