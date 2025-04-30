const express = require("express");
const { getLimiter, postLimiter } = require('../middleware/rateLimiter');
const router = express.Router();
const { registerUser, login, getAllUsers, deleteUser, getOrdersByUserId, getUserById, updateProfile } = require("../controllers/user");
const { isAdmin, authenticate } = require("../middleware/authMiddleware");

router.route("/register").post(postLimiter, registerUser);
router.route("/login").post(postLimiter, login);
router.route("/updateProfile").put(postLimiter, authenticate, updateProfile);
router.route("/").get(authenticate, isAdmin, getLimiter, getAllUsers);
router.route("/delUser/:id").delete(authenticate, isAdmin, postLimiter, deleteUser);
router.route("/getUserOrders/:id").get(authenticate, getLimiter, getOrdersByUserId);
router.route("/getUser/:id").get(authenticate, getLimiter, getUserById);

module.exports = router;
