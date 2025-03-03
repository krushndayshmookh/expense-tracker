/**
 * Script to fix category mapping issues in transactions
 * This script will find transactions with missing category_id and assign a default category
 */

const mongoose = require("mongoose");
const Transaction = require("./models/Transaction");
const Category = require("./models/Category");
const connectDB = require("./config/database");
const logger = require("./utils/logger");

const fixCategoryMapping = async () => {
  let connection;

  try {
    logger.info("Starting category mapping fix...");

    // Connect to MongoDB
    connection = await connectDB();

    // Find a default category (first system category)
    const defaultCategory = await Category.findOne({ user_id: null });

    if (!defaultCategory) {
      logger.error(
        "No default system category found. Please create at least one system category first."
      );
      return;
    }

    logger.info(
      `Using "${defaultCategory.label}" as default category for missing mappings.`
    );

    // Find transactions with missing category
    const transactionsWithoutCategory = await Transaction.find({
      $or: [{ category_id: null }, { category_id: { $exists: false } }],
    });

    logger.info(
      `Found ${transactionsWithoutCategory.length} transactions with missing category mapping.`
    );

    // Update transactions with default category
    let updatedCount = 0;
    for (const transaction of transactionsWithoutCategory) {
      transaction.category_id = defaultCategory._id;
      await transaction.save();
      updatedCount++;

      if (updatedCount % 100 === 0) {
        logger.info(`Updated ${updatedCount} transactions so far...`);
      }
    }

    logger.success(
      `Category mapping fix completed. Updated ${updatedCount} transactions.`
    );
  } catch (error) {
    logger.error("Category mapping fix failed:", error);
  } finally {
    if (connection) {
      logger.info("Closing database connection...");
      await connection.disconnect();
    }

    logger.info("Fix process finished.");
    logger.close();
  }
};

// Run the fix
fixCategoryMapping();
