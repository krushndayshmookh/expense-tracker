const supabase = require("../config/supabase");
const Category = require("../models/Category");
const logger = require("../utils/logger");

/**
 * Migrate categories from Supabase to MongoDB
 * @param {Object} userMap - Mapping of Supabase user IDs to MongoDB user IDs
 */
const migrateCategories = async (userMap) => {
  try {
    logger.info("Starting category migration...");

    // Get all categories from Supabase
    const { data: supabaseCategories, error } = await supabase
      .from("transaction_categories")
      .select("*");

    if (error) {
      throw new Error(
        `Failed to fetch categories from Supabase: ${error.message}`
      );
    }

    logger.info(`Found ${supabaseCategories.length} categories in Supabase`);

    // Process each category
    const categoryMap = {};
    for (const supabaseCategory of supabaseCategories) {
      try {
        // Check if category already exists in MongoDB
        const existingCategory = await Category.findOne({
          supabase_id: supabaseCategory.id,
        });

        if (existingCategory) {
          logger.info(
            `Category ${supabaseCategory.label} already exists in MongoDB, skipping...`
          );
          categoryMap[supabaseCategory.id] = existingCategory._id;
          continue;
        }

        // Map user_id to MongoDB user_id if it exists
        let mongoUserId = null;
        if (supabaseCategory.user_id && userMap[supabaseCategory.user_id]) {
          mongoUserId = userMap[supabaseCategory.user_id];
        }

        // Create new category in MongoDB
        const newCategory = new Category({
          label: supabaseCategory.label,
          user_id: mongoUserId,
          supabase_id: supabaseCategory.id,
          created_at: new Date(supabaseCategory.created_at),
          updated_at: new Date(
            supabaseCategory.updated_at || supabaseCategory.created_at
          ),
        });

        // Save category to MongoDB
        await newCategory.save();

        // Store mapping from Supabase ID to MongoDB ID
        categoryMap[supabaseCategory.id] = newCategory._id;

        logger.success(`Migrated category: ${supabaseCategory.label}`);
      } catch (categoryError) {
        logger.error(
          `Failed to migrate category ${supabaseCategory.label}:`,
          categoryError
        );
      }
    }

    logger.success(
      `Category migration completed. Migrated ${
        Object.keys(categoryMap).length
      } categories.`
    );
    return categoryMap;
  } catch (error) {
    logger.error("Category migration failed:", error);
    throw error;
  }
};

module.exports = migrateCategories;
