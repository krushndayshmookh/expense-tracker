# Supabase to MongoDB Migration Scripts

This directory contains scripts to migrate data from Supabase to MongoDB for the Expense Tracker application.

## Overview

The migration process transfers the following data:

1. Users (from Supabase Auth)
2. Categories (from `transaction_categories` table)
3. Record Sheets (from `record_sheets` table)
4. Transactions (from `transaction_records` table)

## Prerequisites

- Node.js (v14+)
- Access to your Supabase project (URL and service role key)
- MongoDB instance (local or Atlas)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example`:

   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your Supabase and MongoDB credentials:

   ```bash
   # Supabase Credentials
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # MongoDB Connection
   MONGODB_URI=your_mongodb_connection_string

   # Migration Settings
   BATCH_SIZE=100
   ```

## Running the Migration

To run the migration:

```bash
npm run migrate
```

The migration process will:

1. Connect to both Supabase and MongoDB
2. Migrate users from Supabase Auth to MongoDB
3. Migrate categories from Supabase to MongoDB
4. Migrate record sheets from Supabase to MongoDB
5. Migrate transactions from Supabase to MongoDB

## Important Notes

- The migration preserves relationships between entities by mapping Supabase IDs to MongoDB IDs.
- User passwords are set to temporary random values. Users will need to reset their passwords after migration.
- The migration process logs all activities to both the console and a log file in the `logs` directory.
- If the migration is interrupted, you can safely run it again. It will skip entities that have already been migrated.

## Troubleshooting

If you encounter issues:

1. Check the log files in the `logs` directory for detailed error messages.
2. Ensure your Supabase service role key has the necessary permissions.
3. Verify your MongoDB connection string is correct and the database is accessible.

## Post-Migration Steps

After migration:

1. Notify users that they need to reset their passwords.
2. Update your application to use the new MongoDB backend.
3. Verify that all data has been migrated correctly by comparing record counts.
