import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import { FiStar, FiTrash2 } from "react-icons/fi";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = () => api.get("/reviews").then((res) => setReviews(res.data.reviews)).finally(() => setLoading(false));

  useEffect(() => { loadReviews(); }, []);

  const deleteReview = async (productId, reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await api.delete(`/reviews/${productId}/${reviewId}`);
      toast.success("Review deleted");
      loadReviews();
    } catch (err) {
      toast.error("Could not delete review");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Reviews</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : reviews.length === 0 ? (
        <p className="text-gray-500">No reviews yet.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r._id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{r.name} on <span className="text-primary-600">{r.productTitle}</span></p>
                <div className="flex text-amber-500 my-1">
                  {Array.from({ length: 5 }).map((_, i) => <FiStar key={i} size={14} className={i < r.rating ? "fill-current" : "text-gray-300"} />)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300">{r.comment}</p>
              </div>
              <button onClick={() => deleteReview(r.productId, r._id)} className="text-gray-500 hover:text-red-600"><FiTrash2 /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
