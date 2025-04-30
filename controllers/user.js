const asyncHandler = require("../middleware/asyncHandler");
const generateToken = require("../utils/generateToken")
const cleanUser = require("../utils/cleanUser");
const User = require("../model/user");
const Order = require("../model/order");
const bcrypt = require("bcrypt")
const mongoose = require("mongoose");


const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validation checks
    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "Name, email, and password are required" });
    }
    if (name.length > 30) {
        return res.status(400).json({ success: false, message: "Invalid name length" });
    }
    if (name.email > 30) {
        return res.status(400).json({ success: false, message: "Invalid email length" });
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
        role: role || "customer",
    });

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: {
            ...cleanUser(newUser),
            token: generateToken(newUser._id, newUser.role)
        },
    });
});

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    res.status(200).json({
        success: true,
        message: "Login successful",
        user: {
            ...cleanUser(user),
            token: generateToken(user._id, user.role)
        }
    });
});

const updateProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    const { name, email, password } = req.body;

    if (name) {
        if (name.length > 30) {
            return res.status(400).json({ success: false, message: "Name too long" });
        }
        user.name = name;
    }

    if (email) {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: "Invalid email format" });
        }
        user.email = email;
    }

    if (password) {
        if (password.length < 6) {
            return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
        }
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: cleanUser(updatedUser),
    });
});


const getAllUsers = asyncHandler(async (req, res) => {
    const queryObj = {};
    const { page, limit } = req.query
    let users = User.find(queryObj).select("-password");

    let page_num = Number(page) || 1;
    let limit_num = Number(limit) || 3;
    const skip = (page_num - 1) * limit_num;

    const totalUsers = await User.countDocuments(queryObj);
    const totalPages = Math.ceil(totalUsers / limit_num);

    const result = await users.skip(skip).limit(limit_num);

    res.status(200).json({
        result,
        page: page_num,
        totalPages,
        totalUsers,
        results: result.length,
    });
});

const deleteUser = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    res.status(200).json({ message: "User deleted successfully" });
});

const getUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ success: false, message: "Invalid ID format" });
    }

    const user = await User.findById(id);
    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({
        success: true,
        user: cleanUser(user),
    });
});


const getOrdersByUserId = asyncHandler(async (req, res) => {
    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    // Find all orders associated with this user
    const orders = await Order.find({ user: userId })
        .populate("user", "name")
        .populate({
            path: "items.product",
            select: "name price -_id", // Exclude _id from product
        })
        .select("-_id")
        .lean(); // Exclude id from order

    // Check if orders are found
    if (orders.length === 0) {
        return res.status(404).json({ message: "No orders found for this user" });
    }

    res.status(200).json({ orders });
});

module.exports = { registerUser, login, getAllUsers, deleteUser, getUserById, getOrdersByUserId, updateProfile };
