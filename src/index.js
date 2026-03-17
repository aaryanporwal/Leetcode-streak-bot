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
});

client.on(Events.MessageCreate, async (message) => {
  if (message.channel.name !== process.env.CHANNEL_NAME) return;
  if (!message.content.includes("Question" || "question")) {
    return message.reply(
      "Invalid format! Post screenshot with 'question' keyword and an image",
    );
  }

  updateStreak(message.author.id, (error, result) => {
    if (err) return console.error(err);
    if (result.ignored) return;
    message.reply(`🔥 Streak ${result.streak}`);
  });
});

client.login(process.env.DISCORD_TOKEN);

const commands = [
  new SlashCommandBuilder()
    .setName("streak")
    .setDescription("Check your streak!"),

  new SlashCommandBuilder().setName("ping").setDescription("Pong 🐮!"),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("Top streaks"),

  new SlashCommandBuilder().setName("psyduck"),
].map((cmd) => cmd.toJSON());
