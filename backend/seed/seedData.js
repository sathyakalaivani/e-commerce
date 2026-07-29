// Seeds the database with an admin user, categories, and sample products.
// Run with: npm run seed
import dotenv from "dotenv";
import connectDB from "../config/db.js";
import User from "../models/User.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

dotenv.config();

const categoriesData = [
  { name: "Electronics", description: "Phones, laptops, gadgets and accessories" },
  { name: "Fashion", description: "Clothing, footwear and accessories" },
  { name: "Home & Kitchen", description: "Furniture, decor and kitchen essentials" },
  { name: "Books", description: "Fiction, non-fiction and educational books" },
  { name: "Sports & Fitness", description: "Sportswear and fitness equipment" },
];

const run = async () => {
  await connectDB();

  console.log("Clearing existing data...");
  await Promise.all([User.deleteMany(), Category.deleteMany(), Product.deleteMany()]);

  console.log("Creating admin user...");
  await User.create({
    name: "Admin",
    email: process.env.ADMIN_EMAIL || "admin@shopmern.com",
    password: process.env.ADMIN_PASSWORD || "Admin@12345",
    role: "admin",
  });

  console.log("Creating demo customer...");
  await User.create({
    name: "Demo Customer",
    email: "customer@shopmern.com",
    password: "Customer@123",
    role: "user",
  });

  console.log("Creating categories...");
  const categories = await Category.insertMany(categoriesData);
  const catId = (name) => categories.find((c) => c.name === name)._id;

  console.log("Creating products...");
  const products = [
    {
      title: "Wireless Bluetooth Headphones",
      description: "Over-ear wireless headphones with active noise cancellation and 30-hour battery life.",
      category: catId("Electronics"),
      brand: "SoundWave",
      price: 4999,
      discountPrice: 3499,
      stock: 50,
      featured: true,
      images: [{ url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", public_id: "" }],
    },
    {
      title: "Smart Fitness Watch",
      description: "Track your heart rate, steps and sleep with this waterproof smart fitness watch.",
      category: catId("Electronics"),
      brand: "FitTrack",
      price: 6999,
      discountPrice: 5499,
      stock: 35,
      featured: true,
      images: [{ url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600", public_id: "" }],
    },
    {
      title: "Men's Casual Denim Jacket",
      description: "Classic fit denim jacket made from premium cotton, perfect for all seasons.",
      category: catId("Fashion"),
      brand: "UrbanFit",
      price: 2499,
      discountPrice: 1799,
      stock: 60,
      featured: false,
      images: [{ url: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600", public_id: "" }],
    },
    {
      title: "Women's Running Shoes",
      description: "Lightweight breathable running shoes with cushioned soles for maximum comfort.",
      category: catId("Sports & Fitness"),
      brand: "RunPro",
      price: 3499,
      discountPrice: 2799,
      stock: 80,
      featured: true,
      images: [{ url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600", public_id: "" }],
    },
    {
      title: "Non-Stick Cookware Set (5 pcs)",
      description: "Durable non-stick cookware set including pans and pots, dishwasher safe.",
      category: catId("Home & Kitchen"),
      brand: "HomeChef",
      price: 3999,
      discountPrice: 0,
      stock: 25,
      featured: false,
      images: [{ url: "https://images.unsplash.com/photo-1584990347449-a9e8e3d9db6f?w=600", public_id: "" }],
    },
    {
      title: "The Art of Clean Code (Paperback)",
      description: "A practical guide to writing maintainable and readable software.",
      category: catId("Books"),
      brand: "TechPress",
      price: 899,
      discountPrice: 649,
      stock: 100,
      featured: false,
      images: [{ url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600", public_id: "" }],
    },
    {
      title: "Yoga Mat with Carry Strap",
      description: "Extra thick anti-slip yoga mat, eco-friendly and lightweight.",
      category: catId("Sports & Fitness"),
      brand: "ZenFit",
      price: 1299,
      discountPrice: 999,
      stock: 70,
      featured: true,
      images: [{ url: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600", public_id: "" }],
    },
    {
      title: "4K Ultra HD Smart LED TV 43-inch",
      description: "Immersive 4K viewing experience with built-in streaming apps and voice remote.",
      category: catId("Electronics"),
      brand: "VisionMax",
      price: 28999,
      discountPrice: 24999,
      stock: 15,
      featured: true,
      images: [{ url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600", public_id: "" }],
    },
  ];

  await Product.insertMany(products);

  console.log("✅ Seed data created successfully!");
  console.log(`Admin login: ${process.env.ADMIN_EMAIL || "admin@shopmern.com"} / ${process.env.ADMIN_PASSWORD || "Admin@12345"}`);
  console.log("Customer login: customer@shopmern.com / Customer@123");
  process.exit(0);
};

run().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
