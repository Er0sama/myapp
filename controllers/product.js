const Product = require("../model/product");
const asyncHandler = require("../middleware/asyncHandler");
const validateVariantsByCategory = require("../utils/variantValidator");
const mongoose = require("mongoose");
// get all products
const getAllProducts = asyncHandler(async (req, res) => {
    const { company, name, featured, sort, select, page, limit } = req.query;
    const queryObj = {};

    // Query validations
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

const updateProductDescription = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
    }

    if (!description || typeof description !== "string" || description.length > 1000) {
        return res.status(400).json({ message: "Valid description is required (max 1000 chars)" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { description },
        { new: true, runValidators: true }
    );

    if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
        message: "Product description updated successfully",
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
    } = req.body;

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    // check if Product with name already exists
    const existingProduct = await Product.findOne({
        name: { $regex: `^${name}$`, $options: 'i' }
    });
    if (existingProduct.name === name) {
        return res.status(400).json({ message: "Product with the same name already exists" });
    }
    // Validate required fields
    if (!name || !price || !company || !category) {
        return res.status(400).json({ message: "Name, price, company, and category are required" });
    }
    if (name.length > 30) {
        return res.status(400).json({ message: "Name is too long (max 30 characters)" });
    }

    // Validate price
    if (typeof price !== 'number' || price <= 0) {
        return res.status(400).json({ message: "Price must be a positive number" });
    }

    // Validate rating (optional but should be a number between 1 and 5)
    if (rating && (typeof rating !== 'number' || rating < 1 || rating > 5)) {
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Validate stock (if it's provided, it should be a number)
    if (stock && (typeof stock !== 'number' || stock < 0)) {
        return res.status(400).json({ message: "Stock must be a non-negative number" });
    }

    // Validate variants if provided
    if (variants && variants.length > 0) {
        // Ensure each variant has a valid structure
        for (let variant of variants) {
            if (!variant.size || typeof variant.size !== 'string') {
                return res.status(400).json({ message: "Each variant must have a valid option (string)" });
            }
            if (!variant.stock || typeof variant.stock !== 'number' || variant.stock < 0) {
                return res.status(400).json({ message: "Each variant must have a valid stock number (non-negative)" });
            }
            if (variant.price && (typeof variant.price !== 'number' || variant.price < 0)) {
                return res.status(400).json({ message: "Variant price must be a non-negative number" });
            }

        }
        try {
            await validateVariantsByCategory(category, variants);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }

    // If variants are provided, create product with variants
    let newProduct;
    if (variants && variants.length > 0) {


        newProduct = await Product.create({
            name,
            price,
            featured,
            rating,
            createdAt,
            company,
            category,
            variants,
        });
    } else {
        // If no variants, create product with regular stock
        newProduct = await Product.create({
            name,
            price,
            featured,
            rating,
            createdAt,
            company,
            category,
            stock,
        });
    }

    res.status(201).json({ message: "Product created successfully", product: newProduct });
});

const deleteProduct = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const deleted = await Product.findByIdAndDelete(req.params.id); S
    if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product removed" });
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
    updateProductDescription
};
