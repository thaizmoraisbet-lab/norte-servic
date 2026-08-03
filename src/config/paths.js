'use strict';

const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const DATABASE_DIR = path.join(ROOT_DIR, 'database');

module.exports = { ROOT_DIR, PUBLIC_DIR, DATABASE_DIR };
