const path = require("path");
const Database = require("better-sqlite3");

const dbPath = process.env.DB_PATH || path.join(__dirname, "..", "data.db");
console.log(`Using database at: ${dbPath}`);
const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_post_date TEXT,
    questions_solved INTEGER DEFAULT 0
  )
`);

// Migration: add questions_solved column if it doesn't exist yet
try {
  db.exec(`ALTER TABLE users ADD COLUMN questions_solved INTEGER DEFAULT 0`);
} catch (e) {
  // Column already exists — ignore
}

module.exports = db;
