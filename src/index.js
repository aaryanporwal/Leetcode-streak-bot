require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  Events,
  SlashCommandBuilder,
} = require("discord.js");
const { updateStreak } = require("./streaksService");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  console.log(`Bot is in ${readyClient.guilds.cache.size} guilds:`);
  readyClient.guilds.cache.forEach(guild => {
    console.log(` - ${guild.name} (ID: ${guild.id})`);
  });
});

client.on("messageCreate", async (message) => {
  console.log(`Received message from ${message.author.tag} in channel ${message.channel.id}: ${message.content}`);
  if (message.author.bot) return;

  if (message.channel.id !== "1483360122104315997") {
    console.log(`Ignored message from channel: ${message.channel.id}`);
    return;
  }

  if (
    !message.content.toLowerCase().includes("question") ||
    message.attachments.size === 0
  ) {
    console.log(`Invalid format detected: content has 'question'=${message.content.toLowerCase().includes("question")}, attachments=${message.attachments.size}`);
    try {
      console.log("Attempting to send invalid format reply...");
      return await message.reply(
        "Invalid format! Post screenshot with 'question' keyword and an image",
      );
    } catch (err) {
      console.error(`Failed to send reply: ${err.message}`);
      return;
    }
  }

  console.log(`Processing streak for: ${message.author.tag}`);
  updateStreak(message.author.id, async (error, result) => {
    if (error) return console.error("Update streak error:", error);
    if (result.ignored) return;
    try {
      await message.reply(`🔥 Streak ${result.streak} for @${message.author.tag}`);
    } catch (err) {
      console.error(`Failed to send streak reply: ${err.message}`);
    }
  });
});

client.login(process.env.DISCORD_TOKEN);

// const commands = [
//   new SlashCommandBuilder()
//     .setName("streak")
//     .setDescription("Check your streak!"),

//   new SlashCommandBuilder().setName("ping").setDescription("Pong 🐮!"),

//   new SlashCommandBuilder()
//     .setName("leaderboard")
//     .setDescription("Top streaks"),

//   new SlashCommandBuilder().setName("psyduck"),
// ].map((cmd) => cmd.toJSON());
