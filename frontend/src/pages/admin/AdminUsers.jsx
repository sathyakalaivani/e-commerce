import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import { FiTrash2, FiLock, FiUnlock } from "react-icons/fi";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = () => api.get("/users").then((res) => setUsers(res.data.users)).finally(() => setLoading(false));

  useEffect(() => { loadUsers(); }, []);

  const toggleBlock = async (id) => {
    try {
      await api.put(`/users/${id}/block`);
      loadUsers();
    } catch (err) {
      toast.error("Could not update user");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user permanently?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted");
      loadUsers();
    } catch (err) {
      toast.error("Could not delete user");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Users</h1>
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-700">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : users.map((u) => (
              <tr key={u._id} className="border-b border-gray-50 dark:border-gray-700/50">
                <td className="p-4">{u.name}</td>
                <td className="p-4">{u.email}</td>
                <td className="p-4 capitalize">{u.role}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded-full ${u.isBlocked ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
                    {u.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="p-4">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                <td className="p-4 text-right space-x-2">
                  {u.role !== "admin" && (
                    <>
                      <button onClick={() => toggleBlock(u._id)} className="text-gray-500 hover:text-primary-600" title={u.isBlocked ? "Unblock" : "Block"}>
                        {u.isBlocked ? <FiUnlock className="inline" /> : <FiLock className="inline" />}
                      </button>
                      <button onClick={() => deleteUser(u._id)} className="text-gray-500 hover:text-red-600"><FiTrash2 className="inline" /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
