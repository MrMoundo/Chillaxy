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

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const VIDEOS_FILE = "./data/videos.json";
const BANNERS_FILE = "./data/banners.json";

const OWNER_ID = process.env.ADMIN_ID;
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;

/* ===== COMMANDS ===== */

const commands = [
  new SlashCommandBuilder()
    .setName("addvideo")
    .setDescription("Add video")
    .addStringOption(o => o.setName("title").setRequired(true))
    .addStringOption(o => o.setName("youtube").setRequired(true))
    .addStringOption(o => o.setName("description")),

  new SlashCommandBuilder()
    .setName("deletevideo")
    .setDescription("Delete video")
    .addStringOption(o => o.setName("title").setRequired(true)),

  new SlashCommandBuilder()
    .setName("addbanner")
    .setDescription("Add banner (max 5)")
    .addStringOption(o => o.setName("image").setRequired(true))
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);
await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands }
);

/* ===== BOT ===== */

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const member = interaction.member;
  const allowed =
    interaction.user.id === OWNER_ID ||
    (ADMIN_ROLE_ID && member.roles.cache.has(ADMIN_ROLE_ID));

  if (!allowed) {
    return interaction.reply({ content: "❌ Not allowed", ephemeral: true });
  }

  /* ADD VIDEO */
  if (interaction.commandName === "addvideo") {
    const videos = await fs.readJson(VIDEOS_FILE);

    videos.unshift({
      code: Date.now().toString(),
      name: interaction.options.getString("title"),
      videoLink: interaction.options.getString("youtube"),
      description: interaction.options.getString("description") || ""
    });

    await fs.writeJson(VIDEOS_FILE, videos, { spaces: 2 });
    return interaction.reply({ content: "✅ Video added", ephemeral: true });
  }

  /* DELETE VIDEO */
  if (interaction.commandName === "deletevideo") {
    const title = interaction.options.getString("title");
    const videos = await fs.readJson(VIDEOS_FILE);
    await fs.writeJson(
      VIDEOS_FILE,
      videos.filter(v => v.name !== title),
      { spaces: 2 }
    );
    return interaction.reply({ content: "🗑️ Video deleted", ephemeral: true });
  }

  /* ADD BANNER */
  if (interaction.commandName === "addbanner") {
    const banners = await fs.readJson(BANNERS_FILE);

    banners.push({
      url: interaction.options.getString("image"),
      time: Date.now()
    });

    if (banners.length > 5) banners.shift();

    await fs.writeJson(BANNERS_FILE, banners, { spaces: 2 });
    return interaction.reply({ content: "🖼️ Banner added", ephemeral: true });
  }
});

client.login(process.env.BOT_TOKEN);
