const express = require("express");
const router = express.Router();
const { getLimiter, postLimiter } = require('../middleware/rateLimiter');
const { createOrder, getAllOrders, deleteOrder, updateOrder } = require("../controllers/order");
const { isAdmin, authenticate } = require("../middleware/authMiddleware");

router.post("/createOrder", postLimiter, createOrder);
router.get("/", getLimiter, authenticate, isAdmin, getAllOrders);
router.delete("/delOrder/:id", authenticate, isAdmin, postLimiter, deleteOrder);
router.put("/updateOrder/:id", authenticate, isAdmin, postLimiter, updateOrder);


module.exports = router;
