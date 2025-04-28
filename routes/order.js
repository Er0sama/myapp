const express = require("express");
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const { createOrder, getAllOrders, deleteOrder, updateOrder } = require("../controllers/order");
const { isAdmin, authenticate } = require("../middleware/authMiddleware");

router.post("/createOrder", createOrder);
router.get("/", rateLimiter, authenticate, isAdmin, getAllOrders);
router.delete("/delOrder/:id", authenticate, isAdmin, deleteOrder);
router.put("/updateOrder/:id", authenticate, isAdmin, updateOrder);


module.exports = router;
