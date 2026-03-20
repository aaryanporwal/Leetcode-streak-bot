const Database = require("better-sqlite3");
const db = new Database("data.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_post_date TEXT
  )
`);

module.exports = db;
