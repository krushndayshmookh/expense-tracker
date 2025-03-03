const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");

// Register a new user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Get user profile (protected route)
router.get("/profile", auth, authController.getProfile);

// Password reset routes
router.post("/request-reset", authController.requestPasswordReset);
router.get("/verify-reset/:token", authController.verifyResetToken);
router.post("/reset-password", authController.resetPassword);

module.exports = router;
