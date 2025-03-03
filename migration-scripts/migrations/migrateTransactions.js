const supabase = require("../config/supabase");
const Transaction = require("../models/Transaction");
const logger = require("../utils/logger");

/**
 * Migrate transactions from Supabase to MongoDB
 * @param {Object} userMap - Mapping of Supabase user IDs to MongoDB user IDs
 * @param {Object} recordSheetMap - Mapping of Supabase record sheet IDs to MongoDB record sheet IDs
 * @param {Object} categoryMap - Mapping of Supabase category IDs to MongoDB category IDs
 */
const migrateTransactions = async (userMap, recordSheetMap, categoryMap) => {
  try {
    logger.info("Starting transaction migration...");

    // Get batch size from environment or default to 100
    const batchSize = parseInt(process.env.BATCH_SIZE) || 100;
    let count = 0;
    let from = 0;
    let hasMore = true;
    let totalMigrated = 0;

    // Process transactions in batches to avoid memory issues
    while (hasMore) {
      // Get batch of transactions from Supabase
      const { data: supabaseTransactions, error } = await supabase
        .from("transaction_records")
        .select("*")
        .range(from, from + batchSize - 1);

      if (error) {
        throw new Error(
          `Failed to fetch transactions from Supabase: ${error.message}`
        );
      }

      // Check if we have more data to process
      if (supabaseTransactions.length < batchSize) {
        hasMore = false;
      }

      logger.info(
        `Processing batch of ${
          supabaseTransactions.length
        } transactions (${from} to ${from + supabaseTransactions.length - 1})`
      );

      // Process each transaction in the batch
      for (const supabaseTransaction of supabaseTransactions) {
        try {
          // Check if transaction already exists in MongoDB
          const existingTransaction = await Transaction.findOne({
            supabase_id: supabaseTransaction.id,
          });

          if (existingTransaction) {
            logger.info(
              `Transaction ${supabaseTransaction.id} already exists in MongoDB, skipping...`
            );
            totalMigrated++;
            continue;
          }

          // Map IDs to MongoDB IDs
          const mongoUserId = userMap[supabaseTransaction.user_id];
          const mongoRecordSheetId =
            recordSheetMap[supabaseTransaction.record_sheet_id];
          const mongoCategoryId =
            categoryMap[supabaseTransaction.category_id];

          // Skip if any required ID is missing
          if (!mongoUserId || !mongoRecordSheetId || !mongoCategoryId) {
            logger.warning(
              `Missing mapped ID for transaction ${supabaseTransaction.id}, skipping...`
            );
            continue;
          }

          // Create new transaction in MongoDB
          const newTransaction = new Transaction({
            amount: supabaseTransaction.amount,
            description: supabaseTransaction.description || "",
            transaction_type: supabaseTransaction.transaction_type,
            user_id: mongoUserId,
            record_sheet_id: mongoRecordSheetId,
            category_id: mongoCategoryId,
            supabase_id: supabaseTransaction.id,
            created_at: new Date(supabaseTransaction.created_at),
            updated_at: new Date(
              supabaseTransaction.updated_at || supabaseTransaction.created_at
            ),
          });

          // Save transaction to MongoDB
          await newTransaction.save();

          totalMigrated++;

          if (totalMigrated % 100 === 0) {
            logger.info(`Migrated ${totalMigrated} transactions so far...`);
          }
        } catch (transactionError) {
          logger.error(
            `Failed to migrate transaction ${supabaseTransaction.id}:`,
            transactionError
          );
        }
      }

      // Move to next batch
      from += batchSize;
      count += supabaseTransactions.length;

      // If we processed less than batchSize, we're done
      if (supabaseTransactions.length < batchSize) {
        break;
      }
    }

    logger.success(
      `Transaction migration completed. Migrated ${totalMigrated} out of ${count} transactions.`
    );
    return totalMigrated;
  } catch (error) {
    logger.error("Transaction migration failed:", error);
    throw error;
  }
};

module.exports = migrateTransactions;
