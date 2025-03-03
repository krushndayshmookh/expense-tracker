const Category = require("../models/Category");

// Get all categories (both system and user-specific)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      $or: [{ user_id: req.user._id }, { user_id: null }],
    }).sort({ label: 1 });

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new category
exports.createCategory = async (req, res) => {
  try {
    const { label } = req.body;

    if (!label) {
      return res.status(400).json({ message: "Label is required" });
    }

    // Check if category already exists for this user
    const existingCategory = await Category.findOne({
      label,
      $or: [{ user_id: req.user._id }, { user_id: null }],
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const category = new Category({
      label,
      user_id: req.user._id,
    });

    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a category
exports.updateCategory = async (req, res) => {
  try {
    const { label } = req.body;

    if (!label) {
      return res.status(400).json({ message: "Label is required" });
    }

    const category = await Category.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        message:
          "Category not found or you do not have permission to update it",
      });
    }

    category.label = label;
    category.updated_at = Date.now();
    await category.save();

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
  try {
    // First check if the category exists and is a system category
    const categoryToCheck = await Category.findById(req.params.id);

    if (!categoryToCheck) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Prevent deletion of system categories
    if (categoryToCheck.user_id === null) {
      return res.status(403).json({
        message: "System categories cannot be deleted",
        isSystemCategory: true,
      });
    }

    const category = await Category.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!category) {
      return res.status(404).json({
        message:
          "Category not found or you do not have permission to delete it",
      });
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
