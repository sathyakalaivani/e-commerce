import Category from "../models/Category.js";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
import { asyncHandler } from "../middleware/errorHandler.js";

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort("name");
  res.status(200).json({ success: true, categories });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });
  res.status(200).json({ success: true, category });
});

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  let uploadedImage = { url: "", public_id: "" };
  if (image) uploadedImage = await uploadImage(image, "ecommerce/categories");

  const category = await Category.create({ name, description, image: uploadedImage });
  res.status(201).json({ success: true, category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, image } = req.body;
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });

  if (image) {
    if (category.image?.public_id) await deleteImage(category.image.public_id);
    category.image = await uploadImage(image, "ecommerce/categories");
  }
  if (name) category.name = name;
  if (description !== undefined) category.description = description;

  await category.save();
  res.status(200).json({ success: true, category });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: "Category not found" });

  if (category.image?.public_id) await deleteImage(category.image.public_id);
  await category.deleteOne();

  res.status(200).json({ success: true, message: "Category deleted" });
});
