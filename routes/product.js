const express = require("express");
const { getLimiter, postLimiter } = require('../middleware/rateLimiter');
const { uploadImage } = require('../controllers/uploadController');
const router = express.Router();

const { getAllProducts, getAllProductsTesting, addProduct, deleteProduct, updateProduct, viewProductsByCategory } = require("../controllers/product");
const { authenticate, isAdmin } = require("../middleware/authMiddleware");

router.route("/").get(getLimiter, getAllProducts);
router.route("/testing").get(getLimiter, getAllProductsTesting);
router.route("/addProduct").post(authenticate, isAdmin, postLimiter, uploadImage, addProduct);
router.route("/delProduct/:id").delete(authenticate, isAdmin, deleteProduct)
router.route("/updateProduct/:id").patch(authenticate, isAdmin, postLimiter, uploadImage, updateProduct);
router.route("/productsbyCategory/:category").get(getLimiter, viewProductsByCategory);

router.route("/test-upload").post(uploadImage, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ message: "Image uploaded", imageUrl });
});


module.exports = router;
