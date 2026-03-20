const db = require("./db.js");

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function updateStreak(userId, callback) {
  try {
    const today = getToday();
    const yesterday = getYesterday();

    const row = db
      .prepare(`SELECT * FROM users WHERE user_id=?`)
      .get(userId);

    if (!row) {
      db.prepare(
        `INSERT INTO users (user_id, streak, longest_streak, last_post_date) VALUES (?, 1, 1, ?)`
      ).run(userId, today);

      return callback(null, { streak: 1, longest: 1, isNew: true });
    }

    // already counted today
    if (row.last_post_date === today) {
      return callback(null, { ignored: true, streak: row.streak });
    }

    let newStreak = 1;
    if (row.last_post_date === yesterday) {
      newStreak = row.streak + 1;
    }

    const longest = Math.max(row.longest_streak, newStreak);

    db.prepare(`
      UPDATE users
      SET streak=?, longest_streak=?, last_post_date=?
      WHERE user_id=?
    `).run(newStreak, longest, today, userId);

    callback(null, { streak: newStreak, longest });
  } catch (err) {
    callback(err);
  }
}

function getLeaderboard(callback) {
  try {
    const rows = db
      .prepare(`SELECT user_id, streak FROM users ORDER BY streak DESC`)
      .all();

    callback(null, rows);
  } catch (err) {
    callback(err);
  }
}

function getUser(userId, callback) {
  try {
    const row = db
      .prepare(`SELECT * FROM users WHERE user_id=?`)
      .get(userId);

    callback(null, row);
  } catch (err) {
    callback(err);
  }
}

module.exports = {
  updateStreak,
  getLeaderboard,
  getUser,
};