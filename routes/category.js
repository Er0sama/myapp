const express = require("express");
const router = express.Router();
const { getLimiter, postLimiter } = require('../middleware/rateLimiter');
const {
    getAllCategories,
    addCategory,
    deleteCategory
} = require("../controllers/category");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

router.get("/", getLimiter, getAllCategories);
router.post("/add", postLimiter, authenticate, isAdmin, addCategory);
router.delete("/delete/:id", postLimiter, authenticate, isAdmin, deleteCategory);

module.exports = router;
