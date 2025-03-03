const express = require("express");
const router = express.Router();
const recordSheetController = require("../controllers/recordSheetController");
const auth = require("../middleware/auth");

// All routes require authentication
router.use(auth);

// Get all record sheets
router.get("/", recordSheetController.getRecordSheets);

// Get a single record sheet
router.get("/:id", recordSheetController.getRecordSheetById);

// Create a new record sheet
router.post("/", recordSheetController.createRecordSheet);

// Update a record sheet
router.put("/:id", recordSheetController.updateRecordSheet);

// Delete a record sheet
router.delete("/:id", recordSheetController.deleteRecordSheet);

module.exports = router;
