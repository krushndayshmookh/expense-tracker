const supabase = require("../config/supabase");
const RecordSheet = require("../models/RecordSheet");
const logger = require("../utils/logger");

/**
 * Migrate record sheets from Supabase to MongoDB
 * @param {Object} userMap - Mapping of Supabase user IDs to MongoDB user IDs
 */
const migrateRecordSheets = async (userMap) => {
  try {
    logger.info("Starting record sheet migration...");

    // Get all record sheets from Supabase
    const { data: supabaseRecordSheets, error } = await supabase
      .from("record_sheets")
      .select("*");

    if (error) {
      throw new Error(
        `Failed to fetch record sheets from Supabase: ${error.message}`
      );
    }

    logger.info(
      `Found ${supabaseRecordSheets.length} record sheets in Supabase`
    );

    // Process each record sheet
    const recordSheetMap = {};
    for (const supabaseRecordSheet of supabaseRecordSheets) {
      try {
        // Check if record sheet already exists in MongoDB
        const existingRecordSheet = await RecordSheet.findOne({
          supabase_id: supabaseRecordSheet.id,
        });

        if (existingRecordSheet) {
          logger.info(
            `Record sheet ${supabaseRecordSheet.name} already exists in MongoDB, skipping...`
          );
          recordSheetMap[supabaseRecordSheet.id] = existingRecordSheet._id;
          continue;
        }

        // Map user_id to MongoDB user_id
        const mongoUserId = userMap[supabaseRecordSheet.user_id];

        if (!mongoUserId) {
          logger.warning(
            `User ID ${supabaseRecordSheet.user_id} not found in user map, skipping record sheet ${supabaseRecordSheet.name}`
          );
          continue;
        }

        // Create new record sheet in MongoDB
        const newRecordSheet = new RecordSheet({
          name: supabaseRecordSheet.name,
          description: supabaseRecordSheet.description || "",
          user_id: mongoUserId,
          supabase_id: supabaseRecordSheet.id,
          created_at: new Date(supabaseRecordSheet.created_at),
          updated_at: new Date(
            supabaseRecordSheet.updated_at || supabaseRecordSheet.created_at
          ),
        });

        // Save record sheet to MongoDB
        await newRecordSheet.save();

        // Store mapping from Supabase ID to MongoDB ID
        recordSheetMap[supabaseRecordSheet.id] = newRecordSheet._id;

        logger.success(`Migrated record sheet: ${supabaseRecordSheet.name}`);
      } catch (recordSheetError) {
        logger.error(
          `Failed to migrate record sheet ${supabaseRecordSheet.name}:`,
          recordSheetError
        );
      }
    }

    logger.success(
      `Record sheet migration completed. Migrated ${
        Object.keys(recordSheetMap).length
      } record sheets.`
    );
    return recordSheetMap;
  } catch (error) {
    logger.error("Record sheet migration failed:", error);
    throw error;
  }
};

module.exports = migrateRecordSheets;
