const express = require("express");
const rateLimiter = require('../middleware/rateLimiter');
const router = express.Router();
const { registerUser, login, getAllUsers, deleteUser, getOrdersByUserId, getUserById, updateProfile } = require("../controllers/user");
const { isAdmin, authenticate } = require("../middleware/authMiddleware");

router.route("/register").post(rateLimiter, registerUser);
router.route("/login").post(rateLimiter, login);
router.route("/updateProfile").put(rateLimiter, authenticate, updateProfile);
router.route("/").get(authenticate, isAdmin, getAllUsers);
router.route("/delUser/:id").delete(authenticate, isAdmin, deleteUser);
router.route("/getUserOrders/:id").get(authenticate, rateLimiter, getOrdersByUserId);
router.route("/getUser/:id").get(authenticate, rateLimiter, getUserById);

module.exports = router;
