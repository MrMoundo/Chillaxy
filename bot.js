import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";

dotenv.config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

client.once("ready", () => {
  console.log(`Bot logged in as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  // Admin Check
  if (interaction.user.id !== "1322627399313133641") {
    return interaction.reply({ content: "❌ مش مسموح", ephemeral: true });
  }

  if (interaction.commandName === "ping") {
    interaction.reply("🏓 Pong!");
  }
});

client.login(process.env.BOT_TOKEN);
