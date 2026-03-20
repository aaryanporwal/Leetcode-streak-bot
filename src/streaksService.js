const db = require("./db.js");

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function updateStreak(userId) {
  const today = getToday();
  const yesterday = getYesterday();

  const row = db
    .prepare(`SELECT * FROM users WHERE user_id = ?`)
    .get(userId);

  // 🆕 New user
  if (!row) {
    db.prepare(`
      INSERT INTO users (user_id, streak, longest_streak, last_post_date)
      VALUES (?, 1, 1, ?)
    `).run(userId, today);

    return { streak: 1, longest: 1, isNew: true };
  }

  // 🚫 Already counted today
  if (row.last_post_date === today) {
    return { ignored: true, streak: row.streak };
  }

  let newStreak = 1;

  // 🔥 Continue streak
  if (row.last_post_date === yesterday) {
    newStreak = row.streak + 1;
  }

  const longest = Math.max(row.longest_streak, newStreak);

  db.prepare(`
    UPDATE users
    SET streak = ?, longest_streak = ?, last_post_date = ?
    WHERE user_id = ?
  `).run(newStreak, longest, today, userId);

  return { streak: newStreak, longest };
}

function getLeaderboard() {
  return db
    .prepare(`SELECT user_id, streak FROM users ORDER BY streak DESC`)
    .all();
}

function getUser(userId) {
  return db
    .prepare(`SELECT * FROM users WHERE user_id = ?`)
    .get(userId);
}

module.exports = {
  updateStreak,
  getLeaderboard,
  getUser,
};