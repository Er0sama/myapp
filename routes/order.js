const express = require("express");
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const { createOrder, getAllOrders, deleteOrder, updateOrder } = require("../controllers/order");

router.post("/createOrder", createOrder);
router.get("/", rateLimiter, getAllOrders);
router.delete("/delOrder/:id", deleteOrder);
router.put("/updateOrder/:id", updateOrder);


module.exports = router;
