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

const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;
const OWNER_ID = process.env.ADMIN_ID;

/* ================= COMMANDS ================= */

const commands = [
  new SlashCommandBuilder()
    .setName("addvideo")
    .setDescription("Add new video")
    .addStringOption(o =>
      o.setName("title").setDescription("Title").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("youtube").setDescription("YouTube link").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("description").setDescription("Description")
    ),

  new SlashCommandBuilder()
    .setName("deletevideo")
    .setDescription("Delete video by title")
    .addStringOption(o =>
      o.setName("title").setDescription("Title").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("addbanner")
    .setDescription("Add banner to slider (max 5)")
    .addStringOption(o =>
      o.setName("image")
        .setDescription("Banner image URL")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("deletebanner")
    .setDescription("Delete banner by index (0 = oldest)")
    .addIntegerOption(o =>
      o.setName("index")
        .setDescription("Banner index")
        .setRequired(true)
    )
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);
await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands }
);

/* ================= BOT ================= */

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const member = interaction.member;
  const authorized =
    interaction.user.id === OWNER_ID ||
    (ADMIN_ROLE_ID && member.roles.cache.has(ADMIN_ROLE_ID));

  if (!authorized) {
    return interaction.reply({ content: "❌ Not allowed", ephemeral: true });
  }

  /* ===== ADD VIDEO ===== */
  if (interaction.commandName === "addvideo") {
    const title = interaction.options.getString("title");
    const youtube = interaction.options.getString("youtube");
    const description = interaction.options.getString("description") || "";

    const videos = await fs.readJson(VIDEOS_FILE);
    videos.unshift({
      code: Date.now().toString(),
      name: title,
      videoLink: youtube,
      description
    });

    await fs.writeJson(VIDEOS_FILE, videos, { spaces: 2 });

    return interaction.reply({ content: "✅ Video added", ephemeral: true });
  }

  /* ===== DELETE VIDEO ===== */
  if (interaction.commandName === "deletevideo") {
    const title = interaction.options.getString("title");
    const videos = await fs.readJson(VIDEOS_FILE);

    const filtered = videos.filter(v => v.name !== title);
    await fs.writeJson(VIDEOS_FILE, filtered, { spaces: 2 });

    return interaction.reply({ content: "🗑️ Video deleted", ephemeral: true });
  }

  /* ===== ADD BANNER ===== */
  if (interaction.commandName === "addbanner") {
    const image = interaction.options.getString("image");

    const banners = await fs.readJson(BANNERS_FILE);
    banners.push({ url: image, time: Date.now() });

    if (banners.length > 5) banners.shift();

    await fs.writeJson(BANNERS_FILE, banners, { spaces: 2 });

    return interaction.reply({ content: "✅ Banner added", ephemeral: true });
  }

  /* ===== DELETE BANNER ===== */
  if (interaction.commandName === "deletebanner") {
    const index = interaction.options.getInteger("index");
    const banners = await fs.readJson(BANNERS_FILE);

    if (index < 0 || index >= banners.length) {
      return interaction.reply({ content: "❌ Invalid index", ephemeral: true });
    }

    banners.splice(index, 1);
    await fs.writeJson(BANNERS_FILE, banners, { spaces: 2 });

    return interaction.reply({ content: "🗑️ Banner deleted", ephemeral: true });
  }
});

client.login(process.env.BOT_TOKEN);
