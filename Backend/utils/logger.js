// Backend/utils/logger.js
// ================================================================
// 📝 PRODUCTION LOGGER - Centralized Logging
// ================================================================

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Get timestamp
function getTimestamp() {
  return new Date().toISOString();
}

// Log to file
function logToFile(level, message, data = null) {
  const filename = path.join(
    logsDir,
    `payment-${new Date().toISOString().split('T')[0]}.log`
  );

  let logEntry = `[${getTimestamp()}] [${level}] ${message}`;
  if (data) {
    logEntry += ` | DATA: ${JSON.stringify(data, null, 2)}`;
  }
  logEntry += '\n';

  fs.appendFileSync(filename, logEntry);
}

// Console output
function logToConsole(level, emoji, message, data = null) {
  const timestamp = getTimestamp();
  if (data) {
    console.log(`${emoji} [${timestamp}] ${message}`, data);
  } else {
    console.log(`${emoji} [${timestamp}] ${message}`);
  }
}

// ==================== LOGGER METHODS ====================

const logger = {
  info: (message, data = null) => {
    logToConsole('INFO', 'ℹ️', message, data);
    logToFile('INFO', message, data);
  },

  success: (message, data = null) => {
    logToConsole('SUCCESS', '✅', message, data);
    logToFile('SUCCESS', message, data);
  },

  warn: (message, data = null) => {
    logToConsole('WARN', '⚠️', message, data);
    logToFile('WARN', message, data);
  },

  error: (message, data = null) => {
    logToConsole('ERROR', '❌', message, data);
    logToFile('ERROR', message, data);
  },

  debug: (message, data = null) => {
    if (process.env.DEBUG === 'true') {
      logToConsole('DEBUG', '🐛', message, data);
      logToFile('DEBUG', message, data);
    }
  },

  payment: (status, orderId, amount, type, details = null) => {
    const message = `PAYMENT | Status: ${status} | OrderId: ${orderId} | Amount: ₹${amount} | Type: ${type}`;
    logToConsole('PAYMENT', '💳', message, details);
    logToFile('PAYMENT', message, details);
  },
};

module.exports = logger;
