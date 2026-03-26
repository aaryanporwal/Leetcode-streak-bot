/**
 * This file is used to register the slash commands with the Discord API.
 * To run this file, use the command: node src/deploy-commands.js for each guild/server.
 */

require("dotenv").config();
const { REST, Routes, SlashCommandBuilder } = require("discord.js");

const commands = [
  new SlashCommandBuilder()
    .setName("streak")
    .setDescription("Check your current streak"),

  new SlashCommandBuilder()
    .setName("leaderboard")
    .setDescription("View the top streaks"),

  new SlashCommandBuilder()
    .setName("profile")
    .setDescription("View your full profile stats"),

  new SlashCommandBuilder()
    .setName("next-problem")
    .setDescription(
      "Get AI-powered personalized recommendation for the next LeetCode problem to solve"
    ),
].map((cmd) => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  // Note: This will only register commands for the guild specified in .env
  try {
    console.log("Registering slash commands...");
    await rest.put(
      Routes.applicationGuildCommands(
        process.env.CLIENT_ID,
        process.env.GUILD_ID
      ),
      { body: commands }
    );
    console.log("✅ Slash commands registered!");
  } catch (err) {
    console.error("❌ Failed to register commands:", err);
  }
})();
