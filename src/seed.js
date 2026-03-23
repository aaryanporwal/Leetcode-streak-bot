/**
 * Seed script — run with: node src/seed.js
 *
 * Add entries to the `users` array below, then run the script.
 * It will INSERT or UPDATE (upsert) each entry into data.db.
 */

const db = require("./db.js");

const users = [
  { userId: "888444932405207050", streak: 3, longestStreak: 3, lastPostDate: "2026-03-23" },
  { userId: "1410186690743635979", streak: 2, longestStreak: 2, lastPostDate: "2026-03-23" },
  { userId: "1362280969381351646", streak: 2, longestStreak: 2, lastPostDate: "2026-03-23" },
  { userId: "1484519601038430361", streak: 2, longestStreak: 2, lastPostDate: "2026-03-23" },
  { userId: "570304143529476106", streak: 1, longestStreak: 1, lastPostDate: "2026-03-23" },
  { userId: "1392244421554081846", streak: 1, longestStreak: 1, lastPostDate: "2026-03-23" },
];

if (!users.length) {
  console.log("⚠️  No users to seed. Edit the `users` array in src/seed.js first.");
  process.exit(0);
}

const upsert = db.prepare(`
  INSERT INTO users (user_id, streak, longest_streak, last_post_date)
  VALUES (?, ?, ?, ?)
  ON CONFLICT(user_id) DO UPDATE SET
    streak = excluded.streak,
    longest_streak = excluded.longest_streak,
    last_post_date = excluded.last_post_date
`);

const insertMany = db.transaction((entries) => {
  for (const u of entries) {
    upsert.run(u.userId, u.streak, u.longestStreak, u.lastPostDate);
    console.log(`✅ Upserted ${u.userId} — streak: ${u.streak}, longest: ${u.longestStreak}`);
  }
});

insertMany(users);
console.log(`\n🎉 Seeded ${users.length} user(s).`);
