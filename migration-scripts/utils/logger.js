const fs = require("fs");
const path = require("path");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create log file with timestamp
const timestamp = new Date().toISOString().replace(/:/g, "-");
const logFile = path.join(logsDir, `migration-${timestamp}.log`);

// Create a write stream
const logStream = fs.createWriteStream(logFile, { flags: "a" });

// Logger function
const logger = {
  info: (message) => {
    const logMessage = `[INFO] ${new Date().toISOString()}: ${message}`;
    console.log(logMessage);
    logStream.write(logMessage + "\n");
  },
  error: (message, error) => {
    const errorDetails = error ? `\n${error.stack || error}` : "";
    const logMessage = `[ERROR] ${new Date().toISOString()}: ${message}${errorDetails}`;
    console.error(logMessage);
    logStream.write(logMessage + "\n");
  },
  success: (message) => {
    const logMessage = `[SUCCESS] ${new Date().toISOString()}: ${message}`;
    console.log("\x1b[32m%s\x1b[0m", logMessage); // Green color in console
    logStream.write(logMessage + "\n");
  },
  warning: (message) => {
    const logMessage = `[WARNING] ${new Date().toISOString()}: ${message}`;
    console.log("\x1b[33m%s\x1b[0m", logMessage); // Yellow color in console
    logStream.write(logMessage + "\n");
  },
  close: () => {
    logStream.end();
  },
};

module.exports = logger;
