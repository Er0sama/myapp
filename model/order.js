const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    items: [
        {
            product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
            quantity: { type: Number, required: true, default: 1 },
            variant: { type: String },
            priceAtPurchase: { type: Number, required: true },
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
        default: "pending",
    },
    addressSnapshot: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        street: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, required: false, default: "" },
        state: { type: String, required: false, default: "" },
        postalCode: { type: String, required: true },
        country: { type: String, required: true }
    }
}, {
    timestamps: true,
});

module.exports = mongoose.model("Order", orderSchema);
