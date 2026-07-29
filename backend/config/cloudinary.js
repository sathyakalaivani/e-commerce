import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Uploads a base64 data URI (or remote url) to Cloudinary, returns {url, public_id}
export const uploadImage = async (fileStr, folder = "ecommerce") => {
  const res = await cloudinary.uploader.upload(fileStr, {
    folder,
    resource_type: "image",
  });
  return { url: res.secure_url, public_id: res.public_id };
};

export const deleteImage = async (public_id) => {
  if (!public_id) return;
  await cloudinary.uploader.destroy(public_id);
};

export default cloudinary;
