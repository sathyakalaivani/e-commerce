import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import Papa from "papaparse";

import api from "../../api/axios.js";
import Modal from "../../components/Modal.jsx";
import fileToBase64 from "../../utils/fileToBase64.js";

import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiUpload,
  FiDownload,
  FiFileText,
} from "react-icons/fi";

function emptyForm() {
  return {
    title: "",
    description: "",
    category: "",
    brand: "",
    price: "",
    discountPrice: "",
    stock: "",
    featured: false,
  };
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

  // Bulk upload states
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const loadProducts = async () => {
    try {
      setLoading(true);

      const { data } = await api.get("/products", {
        params: { limit: 100 },
      });

      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load products");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD CATEGORIES
  // =========================================================

  const loadCategories = async () => {
    try {
      const { data } = await api.get("/categories");

      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
      toast.error("Could not load categories");
    }
  };

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  // =========================================================
  // CREATE PRODUCT
  // =========================================================

  const openCreate = () => {
    setForm(emptyForm());
    setImageFiles([]);
    setEditingId(null);
    setModalOpen(true);
  };

  // =========================================================
  // EDIT PRODUCT
  // =========================================================

  const openEdit = (p) => {
    setForm({
      title: p.title || "",
      description: p.description || "",
      category: p.category?._id || p.category || "",
      brand: p.brand || "",
      price: p.price || "",
      discountPrice: p.discountPrice || "",
      stock: p.stock || "",
      featured: p.featured || false,
    });

    setImageFiles([]);
    setEditingId(p._id);
    setModalOpen(true);
  };

  // =========================================================
  // SAVE SINGLE PRODUCT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {
      const base64Images = await Promise.all(
        imageFiles.map(fileToBase64)
      );

      if (editingId) {
        await api.put(`/products/${editingId}`, {
          ...form,
          newImages: base64Images,
        });

        toast.success("Product updated");
      } else {
        await api.post("/products", {
          ...form,
          images: base64Images,
        });

        toast.success("Product created");
      }

      setModalOpen(false);
      await loadProducts();

    } catch (err) {
      console.error(err);

      toast.error(
        err.response?.data?.message ||
          "Could not save product"
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================================================
  // DELETE PRODUCT
  // =========================================================

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this product permanently?"
      )
    ) {
      return;
    }

    try {
      await api.delete(`/products/${id}`);

      toast.success("Product deleted");

      await loadProducts();

    } catch (err) {
      console.error(err);

      toast.error("Could not delete product");
    }
  };

  // =========================================================
  // DOWNLOAD CSV TEMPLATE
  // =========================================================

  const downloadCSVTemplate = () => {
    const template = [
      {
        title: "Cotton Kurti",
        description: "Comfortable cotton kurti",
        category: "Women",
        brand: "ABC",
        price: 999,
        discountPrice: 799,
        stock: 20,
        featured: false,
        imageUrl: "",
      },
      {
        title: "Mens Casual Shirt",
        description: "Comfortable casual shirt",
        category: "Men",
        brand: "XYZ",
        price: 899,
        discountPrice: 699,
        stock: 30,
        featured: true,
        imageUrl: "",
      },
    ];

    const csv = Papa.unparse(template);

    const blob = new Blob(
      [csv],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;
    link.download = "products_template.csv";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  // =========================================================
  // SELECT BULK FILE
  // =========================================================

  const handleBulkFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setBulkFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      toast.error("Please select a CSV file");
      e.target.value = "";
      setBulkFile(null);
      return;
    }

    setBulkFile(file);
  };

  // =========================================================
  // BULK CSV UPLOAD
  // =========================================================

  const handleBulkUpload = () => {
    if (!bulkFile) {
      toast.error("Please select a CSV file");
      return;
    }

    setBulkUploading(true);

    Papa.parse(bulkFile, {
      header: true,
      skipEmptyLines: true,

      complete: async (results) => {
        try {
          if (!results.data?.length) {
            toast.error("CSV file is empty");
            setBulkUploading(false);
            return;
          }

          // ---------------------------------------------
          // Convert CSV rows
          // ---------------------------------------------

          const csvProducts = results.data.map((row) => ({
            title: row.title?.trim() || "",

            description:
              row.description?.trim() || "",

            category:
              row.category?.trim() || "",

            brand:
              row.brand?.trim() || "Generic",

            price: Number(row.price),

            discountPrice:
              Number(row.discountPrice) || 0,

            stock:
              Number(row.stock) || 0,

            featured:
              String(row.featured)
                .toLowerCase()
                .trim() === "true",

            imageUrl:
              row.imageUrl?.trim() || "",
          }));

          // ---------------------------------------------
          // Validate products
          // ---------------------------------------------

          const invalidRows = [];

          csvProducts.forEach((product, index) => {
            if (
              !product.title ||
              !product.description ||
              !product.category ||
              !product.price ||
              product.price < 0
            ) {
              invalidRows.push(index + 2);
            }
          });

          if (invalidRows.length > 0) {
            toast.error(
              `Invalid data in CSV row(s): ${invalidRows.join(
                ", "
              )}`
            );

            setBulkUploading(false);

            return;
          }

          // ---------------------------------------------
          // Check categories on frontend
          // ---------------------------------------------

          const categoryNames = categories.map(
            (category) =>
              category.name.toLowerCase().trim()
          );

          const missingCategories = [];

          csvProducts.forEach((product) => {
            const exists = categoryNames.includes(
              product.category.toLowerCase()
            );

            if (!exists) {
              if (
                !missingCategories.some(
                  (name) =>
                    name.toLowerCase() ===
                    product.category.toLowerCase()
                )
              ) {
                missingCategories.push(
                  product.category
                );
              }
            }
          });

          if (missingCategories.length > 0) {
            toast.error(
              `Category not found: ${missingCategories.join(
                ", "
              )}`
            );

            setBulkUploading(false);

            return;
          }

          // ---------------------------------------------
          // Send products to backend
          // ---------------------------------------------

          const response = await api.post(
            "/products/bulk",
            {
              products: csvProducts,
            }
          );

          toast.success(
            `${response.data.created} products added successfully`
          );

          // ---------------------------------------------
          // Reset
          // ---------------------------------------------

          setBulkFile(null);

          setBulkModalOpen(false);

          await loadProducts();

        } catch (err) {
          console.error(
            "Bulk upload error:",
            err
          );

          toast.error(
            err.response?.data?.message ||
              "Bulk upload failed"
          );
        } finally {
          setBulkUploading(false);
        }
      },

      error: (error) => {
        console.error(error);

        toast.error(
          "Could not read CSV file"
        );

        setBulkUploading(false);
      },
    });
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div>

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex items-center justify-between mb-6">

        <h1 className="text-2xl font-bold">
          Products
        </h1>

        <div className="flex items-center gap-3">

          {/* Download Template */}

          <button
            onClick={downloadCSVTemplate}
            className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiDownload />

            CSV Template
          </button>

          {/* Bulk Upload */}

          <button
            onClick={() =>
              setBulkModalOpen(true)
            }
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <FiUpload />

            Bulk Upload
          </button>

          {/* Add Product */}

          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <FiPlus />

            Add Product
          </button>

        </div>
      </div>

      {/* =====================================================
          PRODUCTS TABLE
      ====================================================== */}

      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl overflow-x-auto">

        <table className="w-full text-sm">

          <thead>

            <tr className="text-left text-gray-500 border-b border-gray-100 dark:border-gray-700">

              <th className="p-4">
                Product
              </th>

              <th className="p-4">
                Category
              </th>

              <th className="p-4">
                Price
              </th>

              <th className="p-4">
                Stock
              </th>

              <th className="p-4">
                Featured
              </th>

              <th className="p-4 text-right">
                Actions
              </th>

            </tr>

          </thead>

          <tbody>

            {loading ? (

              <tr>

                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  Loading...
                </td>

              </tr>

            ) : products.length === 0 ? (

              <tr>

                <td
                  colSpan={6}
                  className="p-6 text-center text-gray-500"
                >
                  No products found
                </td>

              </tr>

            ) : (

              products.map((p) => (

                <tr
                  key={p._id}
                  className="border-b border-gray-50 dark:border-gray-700/50"
                >

                  <td className="p-4 flex items-center gap-3">

                    <img
                      src={
                        p.images?.[0]?.url ||
                        "https://placehold.co/40"
                      }
                      className="h-10 w-10 rounded-lg object-cover"
                      alt=""
                    />

                    <span className="line-clamp-1 max-w-[200px]">
                      {p.title}
                    </span>

                  </td>

                  <td className="p-4">
                    {p.category?.name || "-"}
                  </td>

                  <td className="p-4">
                    ₹{p.price}
                  </td>

                  <td className="p-4">
                    {p.stock}
                  </td>

                  <td className="p-4">
                    {p.featured ? "Yes" : "No"}
                  </td>

                  <td className="p-4 text-right space-x-2">

                    <button
                      onClick={() =>
                        openEdit(p)
                      }
                      className="text-gray-500 hover:text-primary-600"
                      title="Edit"
                    >
                      <FiEdit2 className="inline" />
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(p._id)
                      }
                      className="text-gray-500 hover:text-red-600"
                      title="Delete"
                    >
                      <FiTrash2 className="inline" />
                    </button>

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

      {/* =====================================================
          BULK UPLOAD MODAL
      ====================================================== */}

      <Modal
        open={bulkModalOpen}
        onClose={() => {
          if (!bulkUploading) {
            setBulkModalOpen(false);
            setBulkFile(null);
          }
        }}
        title="Bulk Upload Products"
      >

        <div className="space-y-5">

          {/* Instructions */}

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">

            <div className="flex gap-3">

              <FiFileText className="text-blue-600 mt-1" />

              <div>

                <h3 className="font-semibold text-sm">
                  How to upload products
                </h3>

                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Download the CSV template, fill in your
                  product details, save it as CSV, and
                  upload it here.
                </p>

              </div>

            </div>

          </div>

          {/* Template */}

          <button
            type="button"
            onClick={downloadCSVTemplate}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 dark:border-gray-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <FiDownload />

            Download CSV Template
          </button>

          {/* File */}

          <div>

            <label className="block text-sm font-medium mb-2">
              Select CSV File
            </label>

            <input
              type="file"
              accept=".csv"
              onChange={handleBulkFileChange}
              className="w-full text-sm"
              disabled={bulkUploading}
            />

          </div>

          {/* Selected File */}

          {bulkFile && (

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-sm">

              <p>
                <strong>Selected:</strong>{" "}
                {bulkFile.name}
              </p>

              <p className="text-gray-500 mt-1">
                Size:{" "}
                {(bulkFile.size / 1024).toFixed(1)}
                {" "}KB
              </p>

            </div>

          )}

          {/* Upload */}

          <button
            type="button"
            onClick={handleBulkUpload}
            disabled={
              !bulkFile ||
              bulkUploading
            }
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg"
          >

            <FiUpload />

            {bulkUploading
              ? "Uploading Products..."
              : "Upload Products"}

          </button>

        </div>

      </Modal>

      {/* =====================================================
          ADD / EDIT PRODUCT MODAL
      ====================================================== */}

      <Modal
        open={modalOpen}
        onClose={() =>
          setModalOpen(false)
        }
        title={
          editingId
            ? "Edit Product"
            : "Add Product"
        }
      >

        <form
          onSubmit={handleSubmit}
          className="space-y-3"
        >

          {/* Title */}

          <input
            required
            placeholder="Title"
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />

          {/* Description */}

          <textarea
            required
            placeholder="Description"
            rows={3}
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />

          {/* Category */}

          <select
            required
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          >

            <option value="">
              Select Category
            </option>

            {categories.map((c) => (

              <option
                key={c._id}
                value={c._id}
              >
                {c.name}
              </option>

            ))}

          </select>

          {/* Brand */}

          <input
            required
            placeholder="Brand"
            value={form.brand}
            onChange={(e) =>
              setForm({
                ...form,
                brand: e.target.value,
              })
            }
            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
          />

          {/* Price */}

          <div className="grid grid-cols-3 gap-2">

            <input
              required
              type="number"
              min="0"
              placeholder="Price"
              value={form.price}
              onChange={(e) =>
                setForm({
                  ...form,
                  price: e.target.value,
                })
              }
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />

            <input
              type="number"
              min="0"
              placeholder="Discount Price"
              value={form.discountPrice}
              onChange={(e) =>
                setForm({
                  ...form,
                  discountPrice:
                    e.target.value,
                })
              }
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />

            <input
              required
              type="number"
              min="0"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  stock: e.target.value,
                })
              }
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm"
            />

          </div>

          {/* Featured */}

          <label className="flex items-center gap-2 text-sm">

            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) =>
                setForm({
                  ...form,
                  featured:
                    e.target.checked,
                })
              }
            />

            Mark as Featured

          </label>

          {/* Images */}

          <div>

            <label className="block text-sm font-medium mb-1">
              Product Images (multiple allowed)
            </label>

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) =>
                setImageFiles(
                  Array.from(
                    e.target.files
                  )
                )
              }
              className="w-full text-sm"
            />

          </div>

          {/* Submit */}

          <button
            disabled={saving}
            className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold py-2.5 rounded-lg"
          >

            {saving
              ? "Saving..."
              : editingId
              ? "Update Product"
              : "Create Product"}

          </button>

        </form>

      </Modal>

    </div>
  );
}