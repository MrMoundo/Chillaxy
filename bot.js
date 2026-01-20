import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes
} from "discord.js";
import fs from "fs-extra";
import dotenv from "dotenv";

dotenv.config();

const ADMIN_ID = "1322627399313133641";
const DATA_FILE = "./data/videos.json";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Register Slash Command
const commands = [
  new SlashCommandBuilder()
    .setName("addvideo")
    .setDescription("Add new video to Chillaxy site")
    .addStringOption(o =>
      o.setName("title").setDescription("Video title").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("youtube").setDescription("YouTube link").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("description").setDescription("Description").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("links").setDescription("Links separated by ,").setRequired(false)
    )
].map(cmd => cmd.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("Slash commands registered");
})();

client.once("ready", () => {
  console.log(`Bot online as ${client.user.tag}`);
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.user.id !== ADMIN_ID) {
    return interaction.reply({ content: "❌ مش مسموح", ephemeral: true });
  }

  if (interaction.commandName === "addvideo") {
    const title = interaction.options.getString("title");
    const youtube = interaction.options.getString("youtube");
    const desc = interaction.options.getString("description");
    const linksRaw = interaction.options.getString("links");

    const links = linksRaw ? linksRaw.split(",").map(l => l.trim()) : [];

    const videos = await fs.readJson(DATA_FILE);

    videos.push({
      code: Date.now().toString(),
      name: title,
      videoLink: youtube,
      description: desc,
      developer: "MrMoundo",
      description2: "",
      links
    });

    await fs.writeJson(DATA_FILE, videos, { spaces: 2 });

    interaction.reply("✅ الفيديو اتضاف وظهر في الموقع");
  }
});

client.login(process.env.BOT_TOKEN);
