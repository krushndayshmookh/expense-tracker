# Expense Tracker

A full-stack expense tracking application with a Quasar frontend and Node.js backend.

## Project Overview

This monorepo contains a complete expense tracking application with:

- **Frontend**: Quasar/Vue.js application for managing expenses with charts and data visualization
- **Backend**: Node.js API built with Express and MongoDB

## Directory Structure

```text
expense-tracker/
├── frontend/           # Quasar application
├── backend/            # Node.js API
├── Dockerfile          # Docker configuration for backend
├── railway.json        # Railway deployment configuration
├── vercel.json         # Vercel deployment configuration
└── README.md           # This file
```

## Features

- User authentication and account management
- Record sheet tracking for organizing expenses
- Transaction management (income and expenses)
- Category-based expense tracking
- Data visualization with charts
- Responsive design for desktop and mobile
- PWA support

## Technologies

### Frontend

- Quasar Framework (Vue.js)
- Pinia for state management
- Axios for API requests
- Highcharts for data visualization
- PWA capabilities

### Backend

- Node.js with Express
- MongoDB for database
- JWT for authentication
- Resend for email functionality

## Setup and Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)
- Git

### Clone the Repository

```bash
git clone <repository-url>
cd expense-tracker
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory with:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/expense-tracker
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRATION=7d
FRONTEND_URL=http://localhost:9000
RESEND_API_KEY=your_resend_api_key_here
EMAIL_FROM=your_email@example.com
```

Start the backend:

```bash
npm run dev
```

## Development Workflow

### Frontend Development

- Run `npm run dev` in the frontend directory
- Access the application at <http://localhost:9000>

### Backend Development

- Run `npm run dev` in the backend directory
- API will be available at <http://localhost:3000>

## Building for Production

### Running the Frontend

```bash
cd frontend
npm run build
```

### Running the Backend

```bash
cd backend
npm start
```

## Deployment

This project is configured for deployment using:

### Frontend Deployment (Vercel)

- Push to your GitHub repository
- Connect to Vercel
- The `vercel.json` file already contains the necessary configuration

### Backend Deployment (Railway)

- Push to your GitHub repository
- Connect to Railway
- The `railway.json` file already contains the necessary configuration

### Using Docker for Backend

```bash
docker build -t expense-tracker-backend .
docker run -p 3000:3000 expense-tracker-backend
```

## Environment Variables

### for Frontend

Set these in your Vercel project settings or a `.env` file:

- `VITE_API_URL`: URL to your backend API

### for Backend

Set these in your Railway project settings or a `.env` file:

- `PORT`: Server port (default: 3000)
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `JWT_EXPIRATION`: Token expiration time
- `FRONTEND_URL`: URL to frontend application
- `RESEND_API_KEY`: API key for email service
- `EMAIL_FROM`: Sender email address

## License

[MIT License](LICENSE)
