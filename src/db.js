const sqlite3 = require("sqlite3");
const db = new sqlite3.Database("data.db");

try {
  db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        streak INTEGER DEFAULT 0,
        longest_streak INTEGER DEFAULT 0,
        last_post_date TEXT
      )`);
} catch {
  console.error(`Error: ${error.message}`);
} finally {
  db.close();
}
