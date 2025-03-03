const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    record_sheet_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecordSheet",
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    transaction_type: {
      type: String,
      enum: ["income", "expense"],
      default: "expense",
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

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
