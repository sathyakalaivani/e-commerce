import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axios.js";
import Modal from "../../components/Modal.jsx";
import fileToBase64 from "../../utils/fileToBase64.js";
import { FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

function emptyForm() {
  return { title: "", description: "", category: "", brand: "", price: "", discountPrice: "", stock: "", featured: false };
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [imageFiles, setImageFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    setLoading(true);
    const { data } = await api.get("/products", { params: { limit: 100 } });
    setProducts(data.products);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
    api.get("/categories").then((res) => setCategories(res.data.categories));
  }, []);

  const openCreate = () => {
    setForm(emptyForm());
    setImageFiles([]);
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setForm({
      title: p.title,
      description: p.description,
      category: p.category?._id || p.category,
      brand: p.brand,
      price: p.price,
      discountPrice: p.discountPrice,
      stock: p.stock,
      featured: p.featured,
    });
    setImageFiles([]);
    setEditingId(p._id);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const base64Images = await Promise.all(imageFiles.map(fileToBase64));
      if (editingId) {
        await api.put(`/products/${editingId}`, { ...form, newImages: base64Images });
        toast.success("Product updated");
      } else {
        await api.post("/products", { ...form, images: base64Images });
        toast.success("Product created");
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Product deleted");
      loadProducts();
    } catch (err) {
      toast.error("Could not delete product");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Products</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          <FiPlus /> Add Product
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-700">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Stock</th>
              <th className="p-4">Featured</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Loading...</td></tr>
            ) : products.map((p) => (
              <tr key={p._id} className="border-b border-gray-50 dark:border-gray-700/50">
                <td className="p-4 flex items-center gap-3">
                  <img src={p.images?.[0]?.url || "https://via.placeholder.com/40"} className="h-10 w-10 rounded-lg object-cover" alt="" />
                  <span className="line-clamp-1 max-w-[200px]">{p.title}</span>
                </td>
                <td className="p-4">{p.category?.name || "-"}</td>
                <td className="p-4">₹{p.price}</td>
                <td className="p-4">{p.stock}</td>
                <td className="p-4">{p.featured ? "Yes" : "No"}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => openEdit(p)} className="text-gray-500 hover:text-primary-600"><FiEdit2 className="inline" /></button>
                  <button onClick={() => handleDelete(p._id)} className="text-gray-500 hover:text-red-600"><FiTrash2 className="inline" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? "Edit Product" : "Add Product"}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input required placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          <textarea required placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm">
            <option value="">Select Category</option>
            {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <input required placeholder="Brand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          <div className="grid grid-cols-3 gap-2">
            <input required type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            <input type="number" placeholder="Discount Price" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
            <input required type="number" placeholder="Stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Mark as Featured
          </label>
          <div>
            <label className="block text-sm font-medium mb-1">Product Images (multiple allowed)</label>
            <input type="file" multiple accept="image/*" onChange={(e) => setImageFiles(Array.from(e.target.files))}
              className="w-full text-sm" />
          </div>
          <button disabled={saving} className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-2.5 rounded-lg">
            {saving ? "Saving..." : editingId ? "Update Product" : "Create Product"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
