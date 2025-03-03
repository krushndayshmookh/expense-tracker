require("dotenv").config();
const connectDB = require("./config/database");
const logger = require("./utils/logger");

// Import migration functions
const migrateUsers = require("./migrations/migrateUsers");
const migrateCategories = require("./migrations/migrateCategories");
const migrateRecordSheets = require("./migrations/migrateRecordSheets");
const migrateTransactions = require("./migrations/migrateTransactions");

/**
 * Main migration function
 */
const runMigration = async () => {
  let connection;

  try {
    logger.info("Starting Supabase to MongoDB migration...");

    // Connect to MongoDB
    connection = await connectDB();

    // Step 1: Migrate users
    logger.info("Step 1: Migrating users...");
    const userMap = await migrateUsers();

    // Step 2: Migrate categories
    logger.info("Step 2: Migrating categories...");
    const categoryMap = await migrateCategories(userMap);

    // Step 3: Migrate record sheets
    logger.info("Step 3: Migrating record sheets...");
    const recordSheetMap = await migrateRecordSheets(userMap);

    // Step 4: Migrate transactions
    logger.info("Step 4: Migrating transactions...");
    const transactionCount = await migrateTransactions(
      userMap,
      recordSheetMap,
      categoryMap
    );

    // Migration complete
    logger.success("Migration completed successfully!");
    logger.info(`Summary:
    - Users: ${Object.keys(userMap).length}
    - Categories: ${Object.keys(categoryMap).length}
    - Record Sheets: ${Object.keys(recordSheetMap).length}
    - Transactions: ${transactionCount}
    `);
  } catch (error) {
    logger.error("Migration failed:", error);
  } finally {
    // Close database connection and logger
    if (connection) {
      logger.info("Closing database connection...");
      await connection.disconnect();
    }

    logger.info("Migration process finished.");
    logger.close();
  }
};

// Run the migration
runMigration();
