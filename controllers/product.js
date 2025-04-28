const Product = require("../model/product");
const asyncHandler = require("../middleware/asyncHandler");
const validateVariantsByCategory = require("../utils/variantValidator");
const Category = require("../model/category");
const mongoose = require("mongoose");

const getAllProducts = asyncHandler(async (req, res) => {
    const { company, name, featured, sort, select, page, limit } = req.query;
    const queryObj = {};

    if (company) queryObj.company = company;
    if (featured) queryObj.featured = featured === 'true';
    if (name) queryObj.name = { $regex: name, $options: 'i' };

    let query = Product.find(queryObj);

    if (sort) {
        const sortBy = sort.replace(',', " ");
        query = query.sort(sortBy);
    }

    if (select) {
        const fields = select.replace(",", " ");
        query = query.select(fields);

        if (select.includes("category")) {
            query = query.populate("category", "name -_id");
        }
    } else {
        query = query.populate("category", "name -_id");
    }

    let page_num = Number(page) || 1;
    let limit_num = Number(limit) || 4

    let skip = (page_num - 1) * limit_num

    query = query.skip(skip).limit(limit_num)

    const totalProducts = await Product.countDocuments(queryObj);
    const totalPages = Math.ceil(totalProducts / limit_num);
    const response = await query;

    res.status(200).json({
        products: response,
        page: page_num,
        totalPages,
        totalProducts,
        results: response.length,
    });
});

const viewProductsByCategory = asyncHandler(async (req, res) => {
    const { category } = req.params;
    console.log("req.params =>", req.params); // ADD THIS LINE
    console.log(category);
    if (!category) {
        return res.status(400).json({ success: false, message: "Category name is required" });
    }

    if (category.length >= 20) {
        return res.status(400).json({ success: false, message: "Invalid category length." });
    }

    const categoryDoc = await Category.findOne({ name: { $regex: `^${category}$`, $options: 'i' } });

    if (!categoryDoc) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }

    const products = await Product.find({ category: categoryDoc._id }).populate("category", "name");

    if (products.length === 0) {
        return res.status(404).json({ success: false, message: `No products found in category: ${category}` });
    }

    res.status(200).json({
        success: true,
        count: products.length,
        products,
    });
});


const updateProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID" });
    }

    const updateData = { ...req.body };

    // Handle image update if a new file is uploaded
    if (req.file) {
        updateData.image = `/uploads/${req.file.filename}`;
    }

    // Validations
    if (updateData.name) {
        if (typeof updateData.name !== "string" || updateData.name.length > 30) {
            return res.status(400).json({ success: false, message: "Name must be a string with max 30 characters" });
        }
    }

    if (updateData.price) {
        if (isNaN(updateData.price) || updateData.price <= 0) {
            return res.status(400).json({ success: false, message: "Price must be a positive number" });
        }
    }

    if (updateData.description) {
        if (typeof updateData.description !== "string" || updateData.description.length > 1000) {
            return res.status(400).json({ success: false, message: "Description must be a string with max 1000 characters" });
        }
    }

    if (updateData.featured !== undefined) {
        if (typeof updateData.featured !== "boolean") {
            return res.status(400).json({ success: false, message: "Featured must be true or false" });
        }
    }

    if (updateData.rating) {
        if (isNaN(updateData.rating) || updateData.rating < 1 || updateData.rating > 5) {
            return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5" });
        }
    }

    if (updateData.company) {
        const allowedCompanies = ["apple", "samsung", "dell", "mi", "levis", "coca-cola", "nike", "puma", "adidas", "hm", "tropicana", "redbull", "nestle", "lipton", "zara"];
        if (!allowedCompanies.includes(updateData.company)) {
            return res.status(400).json({ success: false, message: "Company is not allowed" });
        }
    }

    if (updateData.stock) {
        if (isNaN(updateData.stock) || updateData.stock < 0) {
            return res.status(400).json({ success: false, message: "Stock must be a non-negative number" });
        }
    }

    // Validate variants if updating
    if (updateData.variants) {
        if (!Array.isArray(updateData.variants)) {
            return res.status(400).json({ success: false, message: "Variants must be an array" });
        }

        for (let variant of updateData.variants) {
            if (!variant.size || typeof variant.size !== "string") {
                return res.status(400).json({ success: false, message: "Each variant must have a valid size (string)" });
            }
            if (variant.stock !== undefined && (isNaN(variant.stock) || variant.stock < 0)) {
                return res.status(400).json({ success: false, message: "Each variant must have a non-negative stock" });
            }
            if (variant.price !== undefined && (isNaN(variant.price) || variant.price < 0)) {
                return res.status(400).json({ success: false, message: "Each variant price must be non-negative" });
            }
        }
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    }).populate("category", "name");

    if (!updatedProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product: updatedProduct,
    });
});



const addProduct = asyncHandler(async (req, res) => {
    const {
        name,
        price,
        featured,
        rating,
        createdAt,
        company,
        category,
        variants,
        stock,
        description,
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : undefined; // not null, undefined is cleaner here

    // Check if Product with same name already exists
    if (await Product.findOne({ name: { $regex: `^${name}$`, $options: 'i' } })) {
        return res.status(400).json({ success: false, message: "Product with the same name already exists" });
    }

    // Validate required fields
    if (!name || !price || !company || !category) {
        return res.status(400).json({ success: false, message: "Name, price, company, and category are required" });
    }
    if (typeof name !== "string" || name.length > 30) {
        return res.status(400).json({ success: false, message: "Name must be a string of max 30 characters" });
    }

    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ success: false, message: "Price must be a positive number" });
    }

    if (rating && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
        return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    if (stock && (typeof stock !== 'number' || stock < 0)) {
        return res.status(400).json({ success: false, message: "Stock must be a non-negative number" });
    }

    if (description && (typeof description !== 'string' || description.length > 1000)) {
        return res.status(400).json({ success: false, message: "Description must be a string of max 1000 characters" });
    }

    if (variants && !Array.isArray(variants)) {
        return res.status(400).json({ success: false, message: "Variants must be an array" });
    }

    // Validate variants if provided
    if (variants && variants.length > 0) {
        for (let variant of variants) {
            if (!variant.size || typeof variant.size !== 'string') {
                return res.status(400).json({ success: false, message: "Each variant must have a valid size (string)" });
            }
            if (variant.size.length > 20) {
                return res.status(400).json({ success: false, message: "Variant size must be max 20 characters" });
            }
            if (variant.stock == undefined || typeof variant.stock !== 'number' || variant.stock < 0) {
                return res.status(400).json({ success: false, message: "Each variant must have a non-negative stock" });
            }
            if (variant.price && (typeof variant.price !== 'number' || variant.price < 0)) {
                return res.status(400).json({ success: false, message: "Variant price must be a non-negative number" });
            }
        }
        try {
            await validateVariantsByCategory(category, variants);
        } catch (error) {
            return res.status(400).json({ success: false, message: error.message });
        }
    }

    const productData = {
        name,
        price,
        featured,
        rating,
        createdAt,
        company,
        category,
        stock,
        description,
        variants,
    };

    if (image) {
        productData.image = image;
    }

    const newProduct = await Product.create(productData);

    res.status(201).json({ success: true, message: "Product created successfully", product: newProduct });
});

const deleteProduct = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid product ID format" });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
        return res.status(404).json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, message: "Product deleted successfully" });
});

const getAllProductsTesting = asyncHandler(async (req, res) => {
    const { company, name, featured, sort } = req.query;
    const queryObj = {};

    let query = Product.find(queryObj).populate("category", "name");

    if (sort) {
        const sortBy = sort.replace(',', " ");
        query = query.sort(sortBy);
    }

    const response = await query;

    res.status(200).json({ response });
});

module.exports = {
    getAllProducts,
    addProduct,
    deleteProduct,
    getAllProductsTesting,
    updateProduct,
    viewProductsByCategory,
};
