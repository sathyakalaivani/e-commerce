import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  title: String,
  image: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: {
      fullName: String,
      phone: String,
      line1: String,
      line2: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    payment: {
      method: { type: String, enum: ["stripe", "cod"], default: "stripe" },
      status: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
      stripePaymentIntentId: String,
      paidAt: Date,
    },
    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Processing",
    },
    trackingHistory: [
      {
        status: String,
        note: String,
        date: { type: Date, default: Date.now },
      },
    ],
    deliveredAt: Date,
    cancelledAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
