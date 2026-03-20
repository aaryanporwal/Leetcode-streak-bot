const Database = require("better-sqlite3");

const db = new Database("data.db");

// create table if not exists
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_post_date TEXT
  )
`).run();

module.exports = db;