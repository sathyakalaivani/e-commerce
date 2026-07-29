import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axios.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/auth/forgot-password", { email });
      setSent(true);
      toast.success("Reset link sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send reset link");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-1">Forgot Password</h1>
      <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a reset link.</p>

      {sent ? (
        <p className="text-sm bg-green-50 text-green-700 p-4 rounded-lg">
          If an account exists for {email}, a password reset link has been sent.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />
          <button disabled={submitting} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg">
            {submitting ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      )}
    </div>
  );
}
