const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        //required: [true, "Description is required"],
        maxlength: 1000,
    },
    image: {
        type: String,
        required: false,
    },
    price: {
        type: Number,
        required: [true, "Price must be entered"],
    },
    featured: {
        type: Boolean,
        default: false,
    },
    rating: {
        type: Number,
        default: 4.0,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
    },
    company: {
        type: String,
        enum: {
            values: ["apple", "samsung", "dell", "mi", "levis", "coca-cola", "nike", "puma", "adidas", "hm", "tropicana", "redbull", "nestle", "lipton", "zara"],
            message: '{VALUE} is not supported',
        },
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },
    stock: {
        type: Number,
        default: 0,
    },
    variants: [
        {
            size: { type: String },
            stock: { type: Number },
            price: { type: Number }
        }
    ]

});

module.exports = mongoose.model("Product", productSchema);