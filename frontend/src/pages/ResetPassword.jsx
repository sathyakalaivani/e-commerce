import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axios.js";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Password reset successfully!");
      navigate("/");
      window.location.reload();
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset link is invalid or expired");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-1">Reset Password</h1>
      <p className="text-gray-500 text-sm mb-6">Choose a new password for your account.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
        />
        <button disabled={submitting} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg">
          {submitting ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
