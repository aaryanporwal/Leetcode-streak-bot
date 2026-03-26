
require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Events,
} = require("discord.js");
const { updateStreak, getLeaderboard, getUser, getRecentQuestions } = require("./streaksService");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ─── Error Handling ──────────────────────────────────────────────────────────
client.on(Events.Error, (error) => {
  console.error("Discord Client Error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
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
  if (message.channel.id !== process.env.STREAK_CHANNEL_ID) return;

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
          if (message.deletable) await message.delete();
          if (reply.deletable) await reply.delete();
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

  // Extract question name
  const questionMatch = message.content.match(/Question[:\s]*(.+)/i);
  const questionName = questionMatch ? questionMatch[1].trim() : "Unknown Question";

  // better-sqlite3 is synchronous — no callback needed
  const result = updateStreak(message.author.id, questionName);
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

  try {
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
      // Defer reply to prevent "Unknown interaction" timeout error
      await interaction.deferReply();

      const row = getUser(user.id);
      if (!row) {
        return interaction.editReply({
          content: "No profile found yet. Post your first solution to get started!",
          ephemeral: true,
        });
      }
      
      const lastQuestions = getRecentQuestions(user.id);
      const questionsList = lastQuestions.length > 0 
        ? lastQuestions.map(q => `• ${q.question_name}`).filter(Boolean).join("\n") 
        : "None";

      return interaction.editReply(
        `📊 **Profile for <@${user.id}>**\n` +
        `🔥 Current Streak: **${row.streak}** day(s)\n` +
        `🏆 Longest Streak: **${row.longest_streak}** day(s)\n` +
        `📝 Total Questions: **${row.questions_solved}**\n` +
        `🕒 Recent 3:\n${questionsList}\n` +
        `📅 Last Post: **${row.last_post_date || "Never"}**`
      );
    }

    // /leaderboard
    if (commandName === "leaderboard") {
      await interaction.deferReply();

      const rows = getLeaderboard();
      if (!rows.length) {
        return interaction.editReply("No streaks yet — be the first to post!");
      }

      const medals = ["🥇", "🥈", "🥉"];
      const board = rows
        .slice(0, 10)
        .map((r, i) => {
          const medal = medals[i] ?? `${i + 1}.`;
          return `${medal} <@${r.user_id}> — **${r.streak}** day(s) | **${r.questions_solved}** solved`;
        })
        .join("\n");

      return interaction.editReply(`🏆 **Leaderboard**\n\n${board}`);
    }
  } catch (error) {
    console.error(`Error handling command ${commandName}:`, error);
    const replyMethod = interaction.deferred ? "editReply" : "reply";
    try {
      await interaction[replyMethod]({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    } catch (innerError) {
      console.error("Failed to send error message:", innerError);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);