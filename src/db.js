const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("data.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_post_date TEXT
    )
  `, (err) => {
    if (err) {
      console.error("Error creating table:", err.message);
    }
  });
});

module.exports = db;
