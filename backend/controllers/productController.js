import Product from "../models/Product.js";
import Category from "../models/Category.js";

import {
  uploadImage,
  deleteImage,
} from "../config/cloudinary.js";

import ApiFeatures from "../utils/apiFeatures.js";
import { asyncHandler } from "../middleware/errorHandler.js";


// ============================================================
// GET ALL PRODUCTS
// @route GET /api/products
// ============================================================

export const getProducts = asyncHandler(async (req, res) => {
  const resPerPage = Number(req.query.limit) || 12;

  const countFeatures = new ApiFeatures(
    Product.find(),
    req.query
  )
    .search()
    .filter();

  const totalProducts =
    await countFeatures.query.clone().countDocuments();

  const features = new ApiFeatures(
    Product.find().populate("category", "name slug"),
    req.query
  )
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
    totalPages: Math.ceil(
      totalProducts / resPerPage
    ),
    currentPage: Number(req.query.page) || 1,
    products,
  });
});


// ============================================================
// GET SINGLE PRODUCT
// @route GET /api/products/:id
// ============================================================

export const getProductById = asyncHandler(
  async (req, res) => {
    const product = await Product.findById(
      req.params.id
    ).populate("category", "name slug");

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    res.status(200).json({
      success: true,
      product,
      relatedProducts,
    });
  }
);


// ============================================================
// CREATE SINGLE PRODUCT
// @route POST /api/products
// ============================================================

export const createProduct = asyncHandler(
  async (req, res) => {
    const {
      title,
      description,
      category,
      brand,
      price,
      discountPrice,
      stock,
      featured,
      images,
    } = req.body;

    let uploadedImages = [];

    if (images && images.length > 0) {
      for (const img of images) {
        const result = await uploadImage(
          img,
          "ecommerce/products"
        );

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

    res.status(201).json({
      success: true,
      product,
    });
  }
);


// ============================================================
// BULK CREATE PRODUCTS
// @route POST /api/products/bulk
// ============================================================

export const bulkCreateProducts = asyncHandler(
  async (req, res) => {
    const { products } = req.body;

    // --------------------------------------------------------
    // Validate request
    // --------------------------------------------------------

    if (
      !Array.isArray(products) ||
      products.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message: "No products provided",
      });
    }

    // --------------------------------------------------------
    // Limit bulk upload
    // --------------------------------------------------------

    if (products.length > 500) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum 500 products can be uploaded at once",
      });
    }

    const preparedProducts = [];

    // --------------------------------------------------------
    // Process every product
    // --------------------------------------------------------

    for (let i = 0; i < products.length; i++) {
      const item = products[i];

      // ---------------------------------------------
      // Validate required fields
      // ---------------------------------------------

      if (
        !item.title ||
        !item.description ||
        !item.category ||
        item.price === undefined ||
        item.price === null ||
        item.price === ""
      ) {
        return res.status(400).json({
          success: false,
          message: `Missing required fields in row ${
            i + 2
          }`,
        });
      }

      // ---------------------------------------------
      // Convert numbers
      // ---------------------------------------------

      const price = Number(item.price);

      const discountPrice =
        Number(item.discountPrice) || 0;

      const stock =
        Number(item.stock) || 0;

      if (Number.isNaN(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid price in row ${
            i + 2
          }`,
        });
      }

      if (
        Number.isNaN(discountPrice) ||
        discountPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid discount price in row ${
            i + 2
          }`,
        });
      }

      if (Number.isNaN(stock) || stock < 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid stock in row ${
            i + 2
          }`,
        });
      }

      // ---------------------------------------------
      // Find category by name
      // ---------------------------------------------

      const categoryName =
        String(item.category).trim();

      const category = await Category.findOne({
        name: {
          $regex: `^${escapeRegex(
            categoryName
          )}$`,
          $options: "i",
        },
      });

      if (!category) {
        return res.status(400).json({
          success: false,
          message: `Category "${categoryName}" not found in row ${
            i + 2
          }`,
        });
      }

      // ---------------------------------------------
      // Prepare images
      // ---------------------------------------------

      let uploadedImages = [];

      /*
        imageUrl can be:

        1. Cloudinary URL
        2. Normal image URL
        3. Base64 data URL

        If imageUrl exists, we try to upload it
        through your existing Cloudinary helper.
      */

      if (item.imageUrl) {
        try {
          const imageResult = await uploadImage(
            String(item.imageUrl).trim(),
            "ecommerce/products"
          );

          uploadedImages.push(imageResult);

        } catch (imageError) {
          console.error(
            `Image upload failed for row ${
              i + 2
            }:`,
            imageError
          );

          return res.status(400).json({
            success: false,
            message: `Image upload failed for "${item.title}"`,
          });
        }
      }

      // ---------------------------------------------
      // Featured conversion
      // ---------------------------------------------

      const featured =
        item.featured === true ||
        String(item.featured)
          .toLowerCase()
          .trim() === "true";

      // ---------------------------------------------
      // Prepare product
      // ---------------------------------------------

      preparedProducts.push({
        title: String(item.title).trim(),

        description:
          String(item.description).trim(),

        category: category._id,

        brand:
          String(item.brand || "Generic").trim(),

        price,

        discountPrice,

        stock,

        featured,

        isNewArrival: true,

        images: uploadedImages,
      });
    }

    // --------------------------------------------------------
    // CREATE ALL PRODUCTS
    // --------------------------------------------------------

    const createdProducts =
      await Product.create(
        preparedProducts
      );

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    res.status(201).json({
      success: true,
      created: createdProducts.length,
      message: `${createdProducts.length} products created successfully`,
      products: createdProducts,
    });
  }
);


// ============================================================
// UPDATE PRODUCT
// @route PUT /api/products/:id
// ============================================================

export const updateProduct = asyncHandler(
  async (req, res) => {
    let product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const {
      images,
      newImages,
      ...rest
    } = req.body;

    if (
      newImages &&
      newImages.length > 0
    ) {
      const uploaded = [];

      for (const img of newImages) {
        const result = await uploadImage(
          img,
          "ecommerce/products"
        );

        uploaded.push(result);
      }

      rest.images = [
        ...(product.images || []),
        ...uploaded,
      ];
    }

    product =
      await Product.findByIdAndUpdate(
        req.params.id,
        rest,
        {
          new: true,
          runValidators: true,
        }
      );

    res.status(200).json({
      success: true,
      product,
    });
  }
);


// ============================================================
// DELETE PRODUCT
// @route DELETE /api/products/:id
// ============================================================

export const deleteProduct = asyncHandler(
  async (req, res) => {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    for (const img of product.images || []) {
      if (img.public_id) {
        await deleteImage(
          img.public_id
        );
      }
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "Product deleted",
    });
  }
);


// ============================================================
// GET FEATURED PRODUCTS
// @route GET /api/products/featured/list
// ============================================================

export const getFeaturedProducts =
  asyncHandler(async (req, res) => {
    const products =
      await Product.find({
        featured: true,
      }).limit(8);

    res.status(200).json({
      success: true,
      products,
    });
  });


// ============================================================
// GET NEW ARRIVALS
// @route GET /api/products/new-arrivals/list
// ============================================================

export const getNewArrivals =
  asyncHandler(async (req, res) => {
    const products =
      await Product.find()
        .sort("-createdAt")
        .limit(8);

    res.status(200).json({
      success: true,
      products,
    });
  });


// ============================================================
// GET BEST SELLERS
// @route GET /api/products/best-sellers/list
// ============================================================

export const getBestSellers =
  asyncHandler(async (req, res) => {
    const products =
      await Product.find()
        .sort("-sold")
        .limit(8);

    res.status(200).json({
      success: true,
      products,
    });
  });


// ============================================================
// HELPER
// ============================================================

function escapeRegex(value) {
  return value.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}