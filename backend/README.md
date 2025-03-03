# Expense Tracker Backend

This is the backend for the Expense Tracker application, built with Node.js, Express, and MongoDB. It provides APIs for managing expenses, record sheets, and categories.

## Features

- User authentication (register, login, profile)
- Record sheets management
- Transaction tracking (income and expenses)
- Categories management

## Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

## Installation

1. Clone the repository
2. Navigate to the backend directory:

   ```bash
   cd backend
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env` file in the root of the backend directory with the following variables:

   ```bash
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRATION=7d
   ```

## Running the Server

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Record Sheets

- `GET /api/record-sheets` - Get all record sheets
- `GET /api/record-sheets/:id` - Get a single record sheet
- `POST /api/record-sheets` - Create a new record sheet
- `PUT /api/record-sheets/:id` - Update a record sheet
- `DELETE /api/record-sheets/:id` - Delete a record sheet

### Transactions

- `GET /api/transactions/record-sheet/:recordSheetId` - Get all transactions for a record sheet
- `GET /api/transactions/:id` - Get a single transaction
- `POST /api/transactions` - Create a new transaction
- `PUT /api/transactions/:id` - Update a transaction
- `DELETE /api/transactions/:id` - Delete a transaction

### Categories

- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create a new category
- `PUT /api/categories/:id` - Update a category
- `DELETE /api/categories/:id` - Delete a category
