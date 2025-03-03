const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const auth = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Get all transactions for a record sheet
router.get(
  "/record-sheet/:recordSheetId",
  transactionController.getTransactions
);

// Get a single transaction
router.get("/:id", transactionController.getTransactionById);

// Create a new transaction
router.post("/", transactionController.createTransaction);

// Update a transaction
router.put("/:id", transactionController.updateTransaction);

// Delete a transaction
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
