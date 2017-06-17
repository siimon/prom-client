'use strict';
const Registry = require('./registry');

// Singleton instance to keep backwards compatibility
module.exports = new Registry();
