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
  db.get(`SELECT * FROM users WHERE user_id=?`, [userId], (err, row) => {
    if (!row) {
      db.run(
        `INSERT INTO users (user_id, streak, longest_streak, last_post_date) VALUES (?, 1, 1, ?)`,
        [userId, today],
      );

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

    db.run(
      `
        UPDATE users
        SET streak=?, longest_streak=?, last_post_date=?
        WHERE user_id=?
      `,
      [newStreak, longest, today, userId],
    );

    callback(null, { streak: newStreak, longest });
  });
}

function getLeaderboard(callback) {
  db.all(`SELECT user_id, streak FROM users ORDER BY streak DESC`, callback);
}

function getUser(userId, callback) {
  db.get(`SELECT * FROM users WHERE user_id=?`, [userId], callback);
}

module.exports = {
  updateStreak,
  getLeaderboard,
  getUser,
};
