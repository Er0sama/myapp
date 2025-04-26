const asyncHandler = require("../middleware/asyncHandler");
const Category = require("../model/category");
const mongoose = require("mongoose");


const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.status(200).json(categories);
});

const addCategory = asyncHandler(async (req, res) => {
    let { name, description } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "" || name.length()) {
        return res.status(400).json({ message: "Category name is required and must be a non-empty string" });
    }

    name = name.trim();

    if (name.length > 30 || email.length > 25) {
        return res.status(400).json({ message: "Invalid Name or email length" });
    }

    const namePattern = /^[a-zA-Z\s\-]+$/;
    if (!namePattern.test(name)) {
        return res.status(400).json({ message: "Category name should contain only letters, spaces, and hyphens" });
    }

    // Optional: check for duplicate category name
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
        return res.status(400).json({ message: "Category with this name already exists" });
    }

    const category = await Category.create({ name, description });
    res.status(201).json({ message: "Category created", category });
});

const deleteCategory = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }


    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({ message: "Invalid category ID format" });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({ message: "Category deleted" });
});

module.exports = {
    getAllCategories,
    addCategory,
    deleteCategory,
};
