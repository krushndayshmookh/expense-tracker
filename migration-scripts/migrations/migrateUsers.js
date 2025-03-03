const supabase = require("../config/supabase");
const User = require("../models/User");
const logger = require("../utils/logger");
const bcrypt = require("bcryptjs");

/**
 * Migrate users from Supabase to MongoDB
 */
const migrateUsers = async () => {
  try {
    logger.info("Starting user migration...");

    // Get all users from Supabase
    const { data: supabaseUsers, error } =
      await supabase.auth.admin.listUsers();

    if (error) {
      throw new Error(`Failed to fetch users from Supabase: ${error.message}`);
    }

    logger.info(`Found ${supabaseUsers.users.length} users in Supabase`);

    // Process each user
    const userMap = {};
    for (const supabaseUser of supabaseUsers.users) {
      try {
        // Check if user already exists in MongoDB
        const existingUser = await User.findOne({
          supabase_id: supabaseUser.id,
        });

        if (existingUser) {
          logger.info(
            `User ${supabaseUser.email} already exists in MongoDB, skipping...`
          );
          userMap[supabaseUser.id] = existingUser._id;
          continue;
        }

        // Create a temporary password (users will need to reset)
        const tempPassword = await bcrypt.hash(
          Math.random().toString(36).slice(-10),
          10
        );

        // Create new user in MongoDB
        const newUser = new User({
          email: supabaseUser.email,
          password: tempPassword, // This is already hashed
          full_name: supabaseUser.user_metadata?.full_name || "",
          supabase_id: supabaseUser.id,
          created_at: new Date(supabaseUser.created_at),
          updated_at: new Date(
            supabaseUser.updated_at || supabaseUser.created_at
          ),
        });

        // Save user to MongoDB
        await newUser.save();

        // Store mapping from Supabase ID to MongoDB ID
        userMap[supabaseUser.id] = newUser._id;

        logger.success(`Migrated user: ${supabaseUser.email}`);
      } catch (userError) {
        logger.error(
          `Failed to migrate user ${supabaseUser.email}:`,
          userError
        );
      }
    }

    logger.success(
      `User migration completed. Migrated ${Object.keys(userMap).length} users.`
    );
    return userMap;
  } catch (error) {
    logger.error("User migration failed:", error);
    throw error;
  }
};

module.exports = migrateUsers;
