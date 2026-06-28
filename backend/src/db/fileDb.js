const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/todos.json');

function ensureDB() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

function readAll() {
  ensureDB();
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
}

function writeAll(todos) {
  ensureDB();
  fs.writeFileSync(DB_PATH, JSON.stringify(todos, null, 2));
}

module.exports = { readAll, writeAll };
