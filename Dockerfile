FROM node:18-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY backend/package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY backend/ .

# Set environment variables
ENV NODE_ENV=production

# Expose the port your app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 