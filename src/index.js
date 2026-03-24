require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Events,
} = require("discord.js");
const { updateStreak, getLeaderboard, getUser } = require("./streaksService");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ─── Ready ───────────────────────────────────────────────────────────────────
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  console.log(`Bot is in ${readyClient.guilds.cache.size} guilds:`);
  readyClient.guilds.cache.forEach((guild) => {
    console.log(` - ${guild.name} (ID: ${guild.id})`);
  });
});

// ─── Message: streak tracking ─────────────────────────────────────────────── 
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const allowedChannels = ["1483360122104315997", "805454591990824961"];
  if (!allowedChannels.includes(message.channel.id)) return;


  if (
    !message.content.toLowerCase().includes("question") ||
    message.attachments.size === 0
  ) {
    try {
      const reply = await message.reply(
        `Please include a screenshot and start your message with the word "Question".`
      );
      
      // Delete both messages after 2 seconds
      setTimeout(async () => {
        try {
          await message.delete();
          await reply.delete();
        } catch (err) {
          console.error(`Failed to delete messages: ${err.message}`);
        }
      }, 2000);
      
      return;
    } catch (err) {
      console.error(`Failed to handle invalid format: ${err.message}`);
      return;
    }
  }

  // better-sqlite3 is synchronous — no callback needed
  const result = updateStreak(message.author.id);

  // React with a fire emoji
  try {
    await message.react("🔥");
  } catch (err) {
    console.error(`Failed to react to message: ${err.message}`);
  }

  if (result.ignored) return;

  try {
    await message.reply(`🔥 Streak: **${result.streak}** — keep it up, <@${message.author.id}>!`);
  } catch (err) {
    console.error(`Failed to send streak reply: ${err.message}`);
  }
});

// ─── Slash Commands ───────────────────────────────────────────────────────────
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user } = interaction;

  // /streak
  if (commandName === "streak") {
    const row = getUser(user.id);
    if (!row) {
      return interaction.reply({
        content: "You haven't posted any solutions yet! Start your streak by posting in the streak channel.",
        ephemeral: true,
      });
    }
    return interaction.reply(
      `🔥 <@${user.id}>'s current streak: **${row.streak}** day(s)`
    );
  }

  // /profile
  if (commandName === "profile") {
    const row = getUser(user.id);
    if (!row) {
      return interaction.reply({
        content: "No profile found yet. Post your first solution to get started!",
        ephemeral: true,
      });
    }
    return interaction.reply(
      `📊 **Profile for <@${user.id}>**\n` +
      `🔥 Current Streak: **${row.streak}** day(s)\n` +
      `🏆 Longest Streak: **${row.longest_streak}** day(s)\n` +
      `📝 Questions Solved: **${row.questions_solved}**\n` +
      `📅 Last Post: **${row.last_post_date}**`
    );
  }

  // /leaderboard
  if (commandName === "leaderboard") {
    const rows = getLeaderboard();
    if (!rows.length) {
      return interaction.reply("No streaks yet — be the first to post!");
    }

    const medals = ["🥇", "🥈", "🥉"];
    const board = rows
      .slice(0, 10)
      .map((r, i) => {
        const medal = medals[i] ?? `${i + 1}.`;
        return `${medal} <@${r.user_id}> — **${r.streak}** day(s) | **${r.questions_solved}** solved`;
      })
      .join("\n");

    return interaction.reply(`🏆 **Leaderboard**\n\n${board}`);
  }
});

client.login(process.env.DISCORD_TOKEN);