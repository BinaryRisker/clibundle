const chalk = require('chalk');

/**
 * Format and output success message
 * @param {string} message - Message to output
 */
function logSuccess(message) {
  console.log(chalk.green(message));
}

/**
 * Format and output error message
 * @param {string} message - Message to output
 */
function logError(message) {
  console.error(chalk.red(message));
}

/**
 * Format and output warning message
 * @param {string} message - Message to output
 */
function logWarning(message) {
  console.warn(chalk.yellow(message));
}

/**
 * Format and output info message
 * @param {string} message - Message to output
 */
function logInfo(message) {
  console.log(chalk.blue(message));
}

/**
 * Check if command is available
 * @param {string} command - Command to check
 * @returns {boolean} Whether the command is available
 */
function isCommandAvailable(command) {
  try {
    require.resolve(command);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  logSuccess,
  logError,
  logWarning,
  logInfo,
  isCommandAvailable
};