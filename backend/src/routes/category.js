const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const auth = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Get all categories
router.get("/", categoryController.getCategories);

// Create a new category
router.post("/", categoryController.createCategory);

// Update a category
router.put("/:id", categoryController.updateCategory);

// Delete a category
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
