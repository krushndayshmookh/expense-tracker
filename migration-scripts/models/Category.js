const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    supabase_id: {
      type: String,
      unique: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

// Compound index to ensure uniqueness of label per user (or for global categories)
categorySchema.index({ label: 1, user_id: 1 }, { unique: true });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
