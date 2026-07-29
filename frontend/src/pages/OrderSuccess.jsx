import { useParams, Link } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";

export default function OrderSuccess() {
  const { id } = useParams();
  return (
    <div className="max-w-md mx-auto px-4 py-24 text-center">
      <FiCheckCircle className="text-green-500 mx-auto mb-4" size={64} />
      <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
      <p className="text-gray-500 mb-8">Thank you for your purchase. Your order confirmation has been sent to your email.</p>
      <div className="flex gap-3 justify-center">
        <Link to={`/orders/${id}`} className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg font-medium text-sm">
          View Order
        </Link>
        <Link to="/products" className="border border-gray-300 dark:border-gray-700 px-5 py-2.5 rounded-lg font-medium text-sm">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
