import mongoose from "mongoose";
import slugify from "slugify";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    image: {
      url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

categorySchema.pre("save", function (next) {
  if (this.isModified("name")) this.slug = slugify(this.name, { lower: true });
  next();
});

export default mongoose.model("Category", categorySchema);
