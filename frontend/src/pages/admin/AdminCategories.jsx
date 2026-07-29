import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import Modal from "../../components/Modal.jsx";
import fileToBase64 from "../../utils/fileToBase64.js";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: "", description: "" });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadCategories = () => api.get("/categories").then((res) => setCategories(res.data.categories));

  useEffect(() => { loadCategories(); }, []);

  const openCreate = () => {
    setForm({ name: "", description: "" });
    setImageFile(null);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setForm({ name: c.name, description: c.description || "" });
    setImageFile(null);
    setEditingId(c._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (imageFile) payload.image = await fileToBase64(imageFile);

      if (editingId) {
        await api.put(`/categories/${editingId}`, payload);
        toast.success("Category updated");
      } else {
        await api.post("/categories", payload);
        toast.success("Category created");
      }
      setModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await api.delete(`/categories/${id}`);
      toast.success("Category deleted");
      loadCategories();
    } catch (err) {
      toast.error("Could not delete category");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <FiPlus /> Add Category
        </button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c._id} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex gap-3">
            <img src={c.image?.url || "https://via.placeholder.com/60"} alt={c.name} className="h-14 w-14 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{c.description}</p>
              <div className="flex gap-3 mt-2">
                <button onClick={() => openEdit(c)} className="text-xs text-primary-600 hover:underline flex items-center gap-1"><FiEdit2 size={12} /> Edit</button>
                <button onClick={() => handleDelete(c._id)} className="text-xs text-red-600 hover:underline flex items-center gap-1"><FiTrash2 size={12} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Category" : "Add Category"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Category Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          <textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          <div>
            <label className="block text-sm font-medium mb-1">Category Image</label>
            <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} className="w-full text-sm" />
          </div>
          <button disabled={saving} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg">
            {saving ? "Saving..." : editingId ? "Update Category" : "Create Category"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
