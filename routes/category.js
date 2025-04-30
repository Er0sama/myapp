const express = require("express");
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const {
    getAllCategories,
    addCategory,
    deleteCategory
} = require("../controllers/category");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

router.get("/", rateLimiter, getAllCategories);
router.post("/add", authenticate, isAdmin, addCategory);
router.delete("/delete/:id",authenticate,isAdmin, deleteCategory);

module.exports = router;
