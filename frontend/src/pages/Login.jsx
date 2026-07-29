import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const ok = await login(form);
    setSubmitting(false);
    if (ok) navigate(location.state?.from?.pathname || "/");
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold mb-1">Welcome Back</h1>
      <p className="text-gray-500 text-sm mb-6">Login to continue shopping</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />
        </div>
        <div>
          <div className="flex justify-between">
            <label className="block text-sm font-medium mb-1">Password</label>
            <Link to="/forgot-password" className="text-xs text-primary-600 hover:underline">Forgot password?</Link>
          </div>
          <input
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />
        </div>
        <button disabled={submitting} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg">
          {submitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-6 text-center">
        Don't have an account? <Link to="/register" className="text-primary-600 font-medium hover:underline">Register</Link>
      </p>

      <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs text-gray-500">
        Demo: <b>customer@shopmern.com</b> / Customer@123 &nbsp;|&nbsp; Admin: <b>admin@shopmern.com</b> / Admin@12345
      </div>
    </div>
  );
}
