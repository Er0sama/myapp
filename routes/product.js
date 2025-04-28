const express = require("express");
const rateLimiter = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');
const router = express.Router();

const { getAllProducts, getAllProductsTesting, addProduct, deleteProduct, updateProduct, viewProductsByCategory } = require("../controllers/product");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

router.route("/").get(rateLimiter, getAllProducts);
router.route("/testing").get(rateLimiter, getAllProductsTesting);
router.route("/addProduct").post(authenticate, isAdmin, upload.single('image'), addProduct);
router.route("/delProduct/:id").delete(authenticate, isAdmin, deleteProduct)
router.route("/updateProduct/:id").patch(authenticate, isAdmin, upload.single('image'), updateProduct);
router.route("/productsbyCategory/:category").get(rateLimiter, viewProductsByCategory);

router.route("/test-upload").post(upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ message: "Image uploaded", imageUrl });
});


module.exports = router;
