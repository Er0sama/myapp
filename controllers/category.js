const asyncHandler = require("../middleware/asyncHandler");
const Category = require("../model/category");
const mongoose = require("mongoose");

const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).lean();
    res.status(200).json(categories);
});

const addCategory = asyncHandler(async (req, res) => {
    let { name, description } = req.body;

    if (!name || typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({ message: "Category name is required and must be a non-empty string" });
    }
    if (name.length > 30) {
        return res.status(400).json({ message: "Category name must be maximum 30 characters" });
    }
    name = name.trim();
    if (description && typeof description === "string") {
        description = description.trim();
    }

    if (description.length > 50) {
        return res.status(400).json({ message: "Category description must be maximum 50 characters" });
    }

    const namePattern = /^[a-zA-Z\s\-]+$/;
    if (!namePattern.test(name)) {
        return res.status(400).json({ message: "Category name should contain only letters, spaces, and hyphens" });
    }

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
