require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const {
  updateStreak,
  getLeaderboard,
  getUser,
  getRecentQuestions,
} = require("./streaksService");
const { getNextProblem } = require("./nextProblemService");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Error Handling
client.on(Events.Error, (error) => {
  console.error("Discord Client Error:", error);
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
});

// Ready
client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  console.log(`Bot is in ${readyClient.guilds.cache.size} guilds:`);
  readyClient.guilds.cache.forEach((guild) => {
    console.log(` - ${guild.name} (ID: ${guild.id})`);
  });
});

// Message: streak tracking
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
  const questionName = questionMatch
    ? questionMatch[1].trim()
    : "Unknown Question";

  // better-sqlite3 is synchronous — no callback needed
  const result = updateStreak(message.author.id, questionName);
  if (result.ignored) return;

  try {
    await message.reply(
      `🔥 Streak: **${result.streak}** — keep it up, <@${message.author.id}>!`
    );
  } catch (err) {
    console.error(`Failed to send streak reply: ${err.message}`);
  }
});

// Slash Commands
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName, user } = interaction;

  try {
    // /streak
    if (commandName === "streak") {
      const row = getUser(user.id);
      if (!row) {
        return interaction.reply({
          content:
            "You haven't posted any solutions yet! Start your streak by posting in the streak channel.",
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
          content:
            "No profile found yet. Post your first solution to get started!",
          ephemeral: true,
        });
      }

      const lastQuestions = getRecentQuestions(user.id);
      const questionsList =
        lastQuestions.length > 0
          ? lastQuestions
              .map((q) => `• ${q.question_name}`)
              .filter(Boolean)
              .join("\n")
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

      return interaction.editReply(`🏆 **Leaderboard**\n\n${board}`, {
        allowedMentions: { users: [] },
      });
    }

    // /next-problem
    if (commandName === "next-problem") {
      await interaction.deferReply();

      try {
        const recommendation = await getNextProblem(user.id);

        if (!recommendation) {
          return interaction.editReply({
            content:
              "No solve history found! Post some solutions first so I can analyze your weaknesses.",
            ephemeral: true,
          });
        }

        if (recommendation.error === "all_solved") {
          return interaction.editReply(
            "🎉 Incredible — you've solved every problem in the dataset! Time to touch grass. 🌿"
          );
        }

        const p = recommendation.recommended_problem;
        const diffEmoji =
          p.difficulty === "Easy" ? "🟢" : p.difficulty === "Medium" ? "🟡" : "🔴";

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`next_problem_next_${p.id}`)
            .setLabel("Next 🧠")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`next_problem_random_${p.id}`)
            .setLabel("Random 🎲")
            .setStyle(ButtonStyle.Secondary)
        );

        return interaction.editReply({
          content:
            `🧠 **Next Problem for <@${user.id}>**\n\n` +
            `${diffEmoji} **${p.title}** (LC #${p.id})\n` +
            `📊 Difficulty: **${p.difficulty}**\n` +
            `🏷️ Topics: ${p.topics.map((t) => `\`${t}\``).join(", ")}\n` +
            `🔗 https://leetcode.com/problems/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}/\n\n` +
            `💡 *${recommendation.reasoning}*`,
          components: [row],
        });
      } catch (geminiError) {
        console.error("Gemini API Error in /next-problem:", geminiError);
        return interaction.editReply({
          content: "⚠️ **Gemini is feeling a bit overwhelmed right now.** (503 Service Unavailable)\n\nPlease try again in a few minutes! Your stats and history are safe.",
          ephemeral: true,
        });
      }
    }
  } catch (error) {
    console.error(`Error handling command ${commandName}:`, error);
    
    // Check if interaction can still be replied to
    if (!interaction.replied && !interaction.deferred) {
      try {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } catch (err) {
        console.error("Failed to send error reply:", err);
      }
    } else if (interaction.deferred || interaction.replied) {
      try {
        await interaction.editReply({
          content: "There was an error while executing this command!",
          components: [], // Remove any stale buttons
        });
      } catch (err) {
        console.error("Failed to edit error reply:", err);
      }
    }
  }
});

// Button Handlers
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;

  const { customId, user } = interaction;

  if (
    customId.startsWith("next_problem_next_") ||
    customId.startsWith("next_problem_random_")
  ) {
    // Check if the user clicking is the same one who initiated the command
    if (interaction.message.content.includes(`<@${user.id}>`) === false) {
      return interaction.reply({
        content: "This recommendation isn't for you! Use `/next-problem` to get your own.",
        ephemeral: true,
      });
    }

    await interaction.deferUpdate();

    // Show loading state by disabling buttons and adding a loading indicator
    const loadingRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("disabled_next")
        .setLabel("Thinking...")
        .setStyle(ButtonStyle.Success)
        .setDisabled(true),
      new ButtonBuilder()
        .setCustomId("disabled_random")
        .setLabel("Random 🎲")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    await interaction.editReply({
      content: interaction.message.content + "\n\n⏳ *Gemini is thinking...*",
      components: [loadingRow],
    });

    const isRandom = customId.startsWith("next_problem_random_");
    const currentId = customId.split("_").pop();

    try {
      const recommendation = await getNextProblem(
        user.id,
        [currentId],
        isRandom
      );

      if (!recommendation || recommendation.error === "all_solved") {
        return interaction.editReply({
          content: "No more problems found or an error occurred.",
          components: [],
        });
      }

      const p = recommendation.recommended_problem;
      const diffEmoji =
        p.difficulty === "Easy" ? "🟢" : p.difficulty === "Medium" ? "🟡" : "🔴";

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`next_problem_next_${p.id}`)
          .setLabel("Next 🧠")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`next_problem_random_${p.id}`)
          .setLabel("Random 🎲")
          .setStyle(ButtonStyle.Secondary)
      );

      return interaction.editReply({
        content:
          `🧠 **${isRandom ? "Random" : "Next"} Problem for <@${user.id}>**\n\n` +
          `${diffEmoji} **${p.title}** (LC #${p.id})\n` +
          `📊 Difficulty: **${p.difficulty}**\n` +
          `🏷️ Topics: ${p.topics.map((t) => `\`${t}\``).join(", ")}\n` +
          `🔗 https://leetcode.com/problems/${p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "")}/\n\n` +
          `💡 *${recommendation.reasoning}*`,
        components: [row],
      });
    } catch (geminiError) {
      console.error("Gemini API Error in button click:", geminiError);
      return interaction.editReply({
        content: interaction.message.content + "\n\n ⚠️ **Gemini is busy.** Please try clicking again in a few seconds.",
        components: interaction.message.components, // Restore previous buttons so user can retry
      });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
