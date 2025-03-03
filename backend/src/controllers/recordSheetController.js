const RecordSheet = require("../models/RecordSheet");

// Get all record sheets for a user
exports.getRecordSheets = async (req, res) => {
  try {
    const recordSheets = await RecordSheet.find({ user_id: req.user._id }).sort(
      { created_at: -1 }
    );
    res.json(recordSheets);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get a single record sheet by ID
exports.getRecordSheetById = async (req, res) => {
  try {
    const recordSheet = await RecordSheet.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!recordSheet) {
      return res.status(404).json({ message: "Record sheet not found" });
    }

    res.json(recordSheet);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Create a new record sheet
exports.createRecordSheet = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const recordSheet = new RecordSheet({
      name,
      description,
      user_id: req.user._id,
    });

    await recordSheet.save();
    res.status(201).json(recordSheet);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update a record sheet
exports.updateRecordSheet = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const recordSheet = await RecordSheet.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user._id },
      { name, description, updated_at: Date.now() },
      { new: true, runValidators: true }
    );

    if (!recordSheet) {
      return res.status(404).json({ message: "Record sheet not found" });
    }

    res.json(recordSheet);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Delete a record sheet
exports.deleteRecordSheet = async (req, res) => {
  try {
    const recordSheet = await RecordSheet.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!recordSheet) {
      return res.status(404).json({ message: "Record sheet not found" });
    }

    res.json({ message: "Record sheet deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
