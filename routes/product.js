const express = require("express");
const rateLimiter = require('../middleware/rateLimiter');
const upload = require('../middleware/upload');
const router = express.Router();

const { getAllProducts, getAllProductsTesting, addProduct, deleteProduct, updateProductDescription } = require("../controllers/product");

router.route("/").get(rateLimiter, getAllProducts);
router.route("/testing").get(rateLimiter, getAllProductsTesting);
router.route("/addProduct").post(upload.single('image'), addProduct);
router.route("/delProduct/:id").delete(deleteProduct)
router.route("/updateProductDescription/:id").patch(updateProductDescription)

router.route("/test-upload").post(upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image uploaded" });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ message: "Image uploaded", imageUrl });
});


module.exports = router;
