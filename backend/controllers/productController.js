import Product from "../models/Product.js";
import { uploadImage, deleteImage } from "../config/cloudinary.js";
import ApiFeatures from "../utils/apiFeatures.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// @desc Get all products with search, filter, sort, pagination
// @route GET /api/products
export const getProducts = asyncHandler(async (req, res) => {
  const resPerPage = Number(req.query.limit) || 12;

  const countFeatures = new ApiFeatures(Product.find(), req.query).search().filter();
  const totalProducts = await countFeatures.query.clone().countDocuments();

  const features = new ApiFeatures(Product.find().populate("category", "name slug"), req.query)
    .search()
    .filter()
    .sort()
    .paginate(resPerPage);

  const products = await features.query;

  res.status(200).json({
    success: true,
    count: products.length,
    totalProducts,
    resPerPage,
    totalPages: Math.ceil(totalProducts / resPerPage),
    currentPage: Number(req.query.page) || 1,
    products,
  });
});

// @desc Get single product + related products
// @route GET /api/products/:id
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category", "name slug");
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
  }).limit(4);

  res.status(200).json({ success: true, product, relatedProducts });
});

// @desc Create product (admin)
// @route POST /api/products
export const createProduct = asyncHandler(async (req, res) => {
  const { title, description, category, brand, price, discountPrice, stock, featured, images } = req.body;

  let uploadedImages = [];
  if (images && images.length > 0) {
    // images expected as array of base64 data URIs from the client
    for (const img of images) {
      const result = await uploadImage(img, "ecommerce/products");
      uploadedImages.push(result);
    }
  }

  const product = await Product.create({
    title,
    description,
    category,
    brand,
    price,
    discountPrice,
    stock,
    featured,
    images: uploadedImages,
  });

  res.status(201).json({ success: true, product });
});

// @desc Update product (admin)
// @route PUT /api/products/:id
export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  const { images, newImages, ...rest } = req.body;

  if (newImages && newImages.length > 0) {
    const uploaded = [];
    for (const img of newImages) {
      const result = await uploadImage(img, "ecommerce/products");
      uploaded.push(result);
    }
    rest.images = [...(product.images || []), ...uploaded];
  }

  product = await Product.findByIdAndUpdate(req.params.id, rest, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, product });
});

// @desc Delete product (admin)
// @route DELETE /api/products/:id
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: "Product not found" });
  }

  for (const img of product.images) {
    await deleteImage(img.public_id);
  }

  await product.deleteOne();
  res.status(200).json({ success: true, message: "Product deleted" });
});

// @desc Get featured products
// @route GET /api/products/featured/list
export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true }).limit(8);
  res.status(200).json({ success: true, products });
});

// @desc Get new arrivals
// @route GET /api/products/new-arrivals/list
export const getNewArrivals = asyncHandler(async (req, res) => {
  const products = await Product.find().sort("-createdAt").limit(8);
  res.status(200).json({ success: true, products });
});

// @desc Get best sellers (by sold count)
// @route GET /api/products/best-sellers/list
export const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find().sort("-sold").limit(8);
  res.status(200).json({ success: true, products });
});
