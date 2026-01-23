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
const BANNERS_FILE = "./data/banners.json";

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
      o.setName("title")
        .setDescription("Video title")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("youtube")
        .setDescription("YouTube URL")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("description")
        .setDescription("Optional description")
    )
    .addStringOption(o =>
      o.setName("links")
        .setDescription("Extra links separated by comma")
    )
    .addStringOption(o =>
      o.setName("mention")
        .setDescription("Role ID or 'everyone' (optional)")
    ),

  new SlashCommandBuilder()
    .setName("editvideo")
    .setDescription("Edit an existing video by title")
    .addStringOption(o =>
      o.setName("title")
        .setDescription("Current video title")
        .setRequired(true)
    )
    .addStringOption(o =>
      o.setName("newtitle")
        .setDescription("New title")
    )
    .addStringOption(o =>
      o.setName("description")
        .setDescription("New description")
    )
    .addStringOption(o =>
      o.setName("links")
        .setDescription("New links separated by comma")
    ),

  new SlashCommandBuilder()
    .setName("deletevideo")
    .setDescription("Delete a video by title")
    .addStringOption(o =>
      o.setName("title")
        .setDescription("Video title")
        .setRequired(true)
    ),

  new SlashCommandBuilder()
    .setName("listvideos")
    .setDescription("List all videos (hidden)"),

  new SlashCommandBuilder()
    .setName("addbanner")
    .setDescription("Add banner to website (max 5)")
    .addStringOption(o =>
      o.setName("image")
        .setDescription("Banner image URL")
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
  if (!interaction.inGuild()) return;

  const member = interaction.member;
  const authorized =
    interaction.user.id === OWNER_ID ||
    (ADMIN_ROLE_ID && member.roles?.cache?.has(ADMIN_ROLE_ID));

  if (!authorized) {
    return interaction.reply({
      content: "You are not authorized to use this command.",
      ephemeral: true
    });
  }

  /* ===== ADD VIDEO ===== */
  if (interaction.commandName === "addvideo") {
    const videos = await fs.readJson(DATA_FILE);

    const title = interaction.options.getString("title");
    const youtube = interaction.options.getString("youtube");
    const description = interaction.options.getString("description") || "";
    const linksRaw = interaction.options.getString("links");
    const mentionRaw = interaction.options.getString("mention");

    const links = linksRaw
      ? linksRaw.split(",").map(l => l.trim()).filter(Boolean)
      : [];

    let mentionText = "";
    if (mentionRaw) {
      if (mentionRaw.toLowerCase() === "everyone") {
        mentionText = "@everyone";
      } else if (/^\d+$/.test(mentionRaw)) {
        mentionText = `<@&${mentionRaw}>`;
      }
    }

    const video = {
      code: Date.now().toString(),
      name: title,
      videoLink: youtube,
      description,
      developer: "MrMoundo",
      description2: "",
      links,
      messageId: null // 🔹 NEW
    };

    videos.push(video);
    await fs.writeJson(DATA_FILE, videos, { spaces: 2 });

    /* ===== BUTTONS ===== */
    const buttons = links.map((link, i) =>
      new ButtonBuilder()
        .setLabel(`Link ${i + 1}`)
        .setStyle(ButtonStyle.Link)
        .setURL(link)
    );

    const rows = buttons.length
      ? [new ActionRowBuilder().addComponents(buttons.slice(0, 5))]
      : [];

    const channel = await client.channels.fetch(CHANNEL_ID);

    if (channel) {
      const msg = await channel.send({
        content: `${mentionText ? mentionText + "\n" : ""}**${title}**\n${description}\n${youtube}`,
        components: rows,
        allowedMentions: {
          parse: mentionText === "@everyone" ? ["everyone"] : ["roles"]
        }
      });

      // 🔹 NEW: حفظ messageId
      video.messageId = msg.id;
      await fs.writeJson(DATA_FILE, videos, { spaces: 2 });
    }

    return interaction.reply({
      content: "Video published successfully.",
      ephemeral: true
    });
  }

  /* ===== EDIT VIDEO ===== */
  if (interaction.commandName === "editvideo") {
    const videos = await fs.readJson(DATA_FILE);
    const title = interaction.options.getString("title");
    const video = videos.find(v => v.name === title);

    if (!video) {
      return interaction.reply({ content: "Video not found.", ephemeral: true });
    }

    const newTitle = interaction.options.getString("newtitle");
    const newDesc = interaction.options.getString("description");
    const linksRaw = interaction.options.getString("links");

    if (newTitle) video.name = newTitle;
    if (newDesc !== null) video.description = newDesc;
    if (linksRaw !== null) {
      video.links = linksRaw
        ? linksRaw.split(",").map(l => l.trim())
        : [];
    }

    await fs.writeJson(DATA_FILE, videos, { spaces: 2 });

    // 🔹 NEW: تعديل رسالة الديسكورد
    if (video.messageId) {
      const channel = await client.channels.fetch(CHANNEL_ID);
      const msg = await channel.messages.fetch(video.messageId).catch(() => null);
      if (msg) {
        await msg.edit(`**${video.name}**\n${video.description}\n${video.videoLink}`);
      }
    }

    return interaction.reply({ content: "Video updated.", ephemeral: true });
  }

  /* ===== DELETE VIDEO ===== */
  if (interaction.commandName === "deletevideo") {
    const videos = await fs.readJson(DATA_FILE);
    const title = interaction.options.getString("title");
    const video = videos.find(v => v.name === title);

    if (!video) {
      return interaction.reply({ content: "Video not found.", ephemeral: true });
    }

    // 🔹 NEW: مسح الرسالة من الشانل
    if (video.messageId) {
      const channel = await client.channels.fetch(CHANNEL_ID);
      const msg = await channel.messages.fetch(video.messageId).catch(() => null);
      if (msg) await msg.delete();
    }

    await fs.writeJson(
      DATA_FILE,
      videos.filter(v => v.name !== title),
      { spaces: 2 }
    );

    return interaction.reply({ content: "Video deleted.", ephemeral: true });
  }

  /* ===== LIST VIDEOS ===== */
  if (interaction.commandName === "listvideos") {
    const videos = await fs.readJson(DATA_FILE);
    const list = videos.length
      ? videos.map(v => `• ${v.name}`).join("\n")
      : "No videos found.";

    return interaction.reply({ content: list, ephemeral: true });
  }

  /* ===== ADD BANNER ===== */
  if (interaction.commandName === "addbanner") {
    const banners = await fs.readJson(BANNERS_FILE);
    banners.push({ url: interaction.options.getString("image"), time: Date.now() });
    if (banners.length > 5) banners.shift();

    await fs.writeJson(BANNERS_FILE, banners, { spaces: 2 });

    return interaction.reply({ content: "Banner added successfully.", ephemeral: true });
  }
});

client.login(process.env.BOT_TOKEN);
