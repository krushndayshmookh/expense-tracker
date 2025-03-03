const Transaction = require("../models/Transaction");
const RecordSheet = require("../models/RecordSheet");

// Get all transactions for a record sheet
exports.getTransactions = async (req, res) => {
  try {
    const { recordSheetId } = req.params;

    // Verify record sheet belongs to user
    const recordSheet = await RecordSheet.findOne({
      _id: recordSheetId,
      user_id: req.user._id,
    });

    if (!recordSheet) {
      return res.status(404).json({ message: "Record sheet not found" });
    }

    const transactions = await Transaction.find({
      record_sheet_id: recordSheetId,
    }).sort({ created_at: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const {
      record_sheet_id,
      amount,
      description,
      category_id,
      transaction_type,
    } = req.body;

    if (!record_sheet_id || !amount) {
      return res
        .status(400)
        .json({ message: "Record sheet ID and amount are required" });
    }

    // Verify record sheet belongs to user
    const recordSheet = await RecordSheet.findOne({
      _id: record_sheet_id,
      user_id: req.user._id,
    });

    if (!recordSheet) {
      return res.status(404).json({ message: "Record sheet not found" });
    }

    const transaction = new Transaction({
      record_sheet_id,
      user_id: req.user._id,
      amount,
      description,
      category_id,
      transaction_type: transaction_type || "expense",
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a transaction
exports.updateTransaction = async (req, res) => {
  try {
    const {
      amount,
      description,
      category_id,
      transaction_type,
      record_sheet_id,
    } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    // Find the transaction
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // If record sheet is changing, verify the new one belongs to user
    if (
      record_sheet_id &&
      record_sheet_id !== transaction.record_sheet_id.toString()
    ) {
      const recordSheet = await RecordSheet.findOne({
        _id: record_sheet_id,
        user_id: req.user._id,
      });

      if (!recordSheet) {
        return res.status(404).json({ message: "Record sheet not found" });
      }

      transaction.record_sheet_id = record_sheet_id;
    }

    transaction.amount = amount;
    transaction.description = description;
    transaction.category_id = category_id;
    transaction.transaction_type =
      transaction_type || transaction.transaction_type;
    transaction.updated_at = Date.now();

    await transaction.save();
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
