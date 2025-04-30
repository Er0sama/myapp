const asyncHandler = require("../middleware/asyncHandler");
const Order = require("../model/order");
const Product = require("../model/product");
const User = require("../model/user");
const { saveAddress, validateAddress } = require("../utils/saveAddress");
const mongoose = require("mongoose");

// Utility function to calculate total price from items
const validateAndFixTotalPrice = async (items) => {
    let totalPrice = 0;

    for (const item of items) {
        if (!item.product || !item.quantity || !item.priceAtPurchase) {
            return { error: "Each item must include product, quantity, and priceAtPurchase" };
        }

        const product = await Product.findById(item.product);
        if (!product) {
            return { error: `Product with ID ${item.product} not found` };
        }

        totalPrice += item.priceAtPurchase * item.quantity;
    }

    return { totalPrice };
};


const createOrder = asyncHandler(async (req, res) => {
    const { user, items, totalPrice, address } = req.body;

    if (!user || !items || !Array.isArray(items) || items.length === 0 || totalPrice === undefined) {
        return res.status(400).json({ message: "User, items, and totalPrice are required" });
    }

    // Check if user exists
    if (!mongoose.Types.ObjectId.isValid(user)) {
        return res.status(400).json({ success: false, message: "Invalid ID" });
    }
    const foundUser = await User.findById(user);
    if (!foundUser) {
        return res.status(404).json({ message: "User not found" });
    }
    const productIds = items.map(item => item.product);
    const productsMap = new Map(
        (await Product.find({ _id: { $in: productIds } })).map(p => [p._id.toString(), p])
    );

    for (const item of items) {
        if (!item.product || !item.quantity || !item.priceAtPurchase) {
            res.status(400);
            throw new Error("Each item must include product, quantity, and priceAtPurchase");
        }

        const foundProduct = productsMap.get(item.product);
        if (!foundProduct) {
            return res.status(400).json({ message: `Product ${item.product} does not exist` });
        }
    }


    const result = await validateAndFixTotalPrice(items);
    if (result.error) {
        return res.status(400).json({ message: result.error });
    }

    const fixedTotalPrice = result.totalPrice;

    if (fixedTotalPrice !== totalPrice) {
        console.warn(`Client provided incorrect total (${totalPrice}), corrected to ${fixedTotalPrice}`);
    }
    // Validate address once
    const addressValidationError = validateAddress(address);
    if (addressValidationError) {
        return res.status(400).json({ message: addressValidationError });
    }
    console.log(address);

    const newOrder = await Order.create({
        user,
        items,
        totalPrice: fixedTotalPrice,
        addressSnapshot: {
            fullName: address.fullName,
            email: address.email,
            phone: address.phone,
            street: address.street,
            city: address.city,
            province: address.province,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country
        }
    });
    //console.log("code running till here")
    res.status(201).json({ message: "Order placed", order: newOrder });

});

const getAllOrders = asyncHandler(async (req, res) => {
    const { sort, select, page, limit } = req.query;

    const queryObj = {}; // for filters if needed

    let query = Order.find(queryObj)
        .populate("user", "name email role")
        .populate("items.product", "name price");

    if (sort) {
        const sortBy = sort.replace(',', " ");
        query = query.sort(sortBy);
    }

    if (select) {
        const fields = select.replace(",", " ");
        query = query.select(fields);
    }

    const page_num = Number(page) || 1;
    const limit_num = Number(limit) || 4;
    const skip = (page_num - 1) * limit_num;

    const totalOrders = await Order.countDocuments(queryObj);
    const totalPages = Math.ceil(totalOrders / limit_num);

    const orders = await query.skip(skip).limit(limit_num);

    res.status(200).json({
        orders,
        page: page_num,
        totalPages,
        totalOrders,
        results: orders.length,
    });
});


const deleteOrder = asyncHandler(async (req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const order = await Order.findByIdAndDelete(req.params.id);

    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: "Order deleted" });
});

const updateOrder = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: "Invalid ID format" });
    }

    const { status } = req.body;

    const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

    if (!status || !allowedStatuses.includes(status)) {
        return res.status(400).json({
            message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(", ")}`,
        });
    }

    const order = await Order.findById(id);
    if (!order) {
        return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === status) {
        return res.status(400).json({ message: "The order is already in the requested status" });
    }
    order.status = status;
    const updatedOrder = await order.save();

    res.status(200).json({ message: "Order status updated", order: updatedOrder });
});

module.exports = { createOrder, getAllOrders, deleteOrder, updateOrder };
