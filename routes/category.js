const express = require("express");
const router = express.Router();
const rateLimiter = require('../middleware/rateLimiter');
const {
    getAllCategories,
    addCategory,
    deleteCategory
} = require("../controllers/category");

router.get("/", rateLimiter, getAllCategories);
router.post("/add", addCategory);
router.delete("/delete/:id", deleteCategory);

module.exports = router;
