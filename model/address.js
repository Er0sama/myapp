const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    fullName: { type: String, required: true },
    email: {
        type: String,
        required: true,
        match: [/\S+@\S+\.\S+/, 'Email is invalid'],
    },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: false },
    province: { type: String, required: false },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Address", addressSchema);
