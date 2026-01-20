import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} from "discord.js";
import fs from "fs-extra";
import dotenv from "dotenv";

dotenv.config();

const CHANNEL_ID = "1298667533485735969";
const DATA_FILE = "./data/videos.json";
const ADMIN_ROLE_ID = process.env.ADMIN_ROLE_ID;
const OWNER_ID = process.env.ADMIN_ID;

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ================= COMMANDS ================= */

const commands = [
  new SlashCommandBuilder()
    .setName("addvideo")
    .setDescription("Publish a new video")
    .addStringOption(o =>
      o.setName("title").setDescription("Video title").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("youtube").setDescription("YouTube URL").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("description").setDescription("Optional description").setRequired(false)
    )
    .addStringOption(o =>
      o.setName("links").setDescription("Extra links separated by comma").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("editvideo")
    .setDescription("Edit an existing video by title")
    .addStringOption(o =>
      o.setName("title").setDescription("Current video title").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("newtitle").setDescription("New title").setRequired(false)
    )
    .addStringOption(o =>
      o.setName("description").setDescription("New description").setRequired(false)
    )
    .addStringOption(o =>
      o.setName("links").setDescription("New links separated by comma").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("deletevideo")
    .setDescription("Delete a video by title")
    .addStringOption(o =>
      o.setName("title").setDescription("Video title").setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("listvideos")
    .setDescription("List all videos (hidden)")
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
    return interaction.reply({
      content: "You are not authorized to use this command.",
      ephemeral: true
    });
  }

  const videos = await fs.readJson(DATA_FILE);

  /* ===== ADD VIDEO ===== */
  if (interaction.commandName === "addvideo") {
    const title = interaction.options.getString("title");
    const youtube = interaction.options.getString("youtube");
    const description = interaction.options.getString("description") || "";
    const linksRaw = interaction.options.getString("links");

    const links = linksRaw ? linksRaw.split(",").map(l => l.trim()) : [];

    videos.push({
      code: Date.now().toString(),
      name: title,
      videoLink: youtube,
      description,
      developer: "MrMoundo",
      description2: "",
      links
    });

    await fs.writeJson(DATA_FILE, videos, { spaces: 2 });

    const buttons = links.map((_, i) =>
      new ButtonBuilder()
        .setCustomId(`link_${Date.now()}_${i}`)
        .setLabel("Links")
        .setStyle(ButtonStyle.Secondary)
    );

    const rows = buttons.length
      ? [new ActionRowBuilder().addComponents(buttons.slice(0, 5))]
      : [];

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel) {
      await channel.send({
        content: `**${title}**\n${description}\n${youtube}`,
        components: rows,
        allowedMentions: { parse: [] }
      });
    }

    return interaction.reply({
      content: "Video published successfully.",
      ephemeral: true
    });
  }

  /* ===== EDIT VIDEO ===== */
  if (interaction.commandName === "editvideo") {
    const title = interaction.options.getString("title");
    const newTitle = interaction.options.getString("newtitle");
    const newDesc = interaction.options.getString("description");
    const linksRaw = interaction.options.getString("links");

    const video = videos.find(v => v.name === title);
    if (!video) {
      return interaction.reply({
        content: "Video not found.",
        ephemeral: true
      });
    }

    if (newTitle) video.name = newTitle;
    if (newDesc !== null) video.description = newDesc;
    if (linksRaw !== null) {
      video.links = linksRaw
        ? linksRaw.split(",").map(l => l.trim())
        : [];
    }

    await fs.writeJson(DATA_FILE, videos, { spaces: 2 });

    return interaction.reply({
      content: "Video updated successfully.",
      ephemeral: true
    });
  }

  /* ===== DELETE VIDEO ===== */
  if (interaction.commandName === "deletevideo") {
    const title = interaction.options.getString("title");
    const filtered = videos.filter(v => v.name !== title);

    if (filtered.length === videos.length) {
      return interaction.reply({
        content: "Video not found.",
        ephemeral: true
      });
    }

    await fs.writeJson(DATA_FILE, filtered, { spaces: 2 });

    return interaction.reply({
      content: "Video deleted successfully.",
      ephemeral: true
    });
  }

  /* ===== LIST VIDEOS (HIDDEN) ===== */
  if (interaction.commandName === "listvideos") {
    if (!videos.length) {
      return interaction.reply({
        content: "No videos found.",
        ephemeral: true
      });
    }

    const list = videos.map(v => `• ${v.name}`).join("\n");
    return interaction.reply({
      content: list,
      ephemeral: true
    });
  }
});

client.login(process.env.BOT_TOKEN);
