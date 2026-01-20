import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder
} from "discord.js";
import fs from "fs-extra";
import dotenv from "dotenv";

dotenv.config();

const ADMIN_ID = "1322627399313133641";
const CHANNEL_ID = "1298667533485735969";
const DATA_FILE = "./data/videos.json";

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

/* ===== Slash Commands ===== */
const commands = [
  new SlashCommandBuilder()
    .setName("addvideo")
    .setDescription("Add new video")
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
      o.setName("links").setDescription("Extra links , separated").setRequired(false)
    ),

  new SlashCommandBuilder()
    .setName("deletevideo")
    .setDescription("Delete video by code")
    .addStringOption(o =>
      o.setName("code").setDescription("Video code").setRequired(true)
    )
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
  await rest.put(
    Routes.applicationCommands(process.env.CLIENT_ID),
    { body: commands }
  );
  console.log("Slash commands registered");
})();

/* ===== Bot Ready ===== */
client.once("ready", () => {
  console.log(`Bot online as ${client.user.tag}`);
});

/* ===== Interactions ===== */
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.user.id !== ADMIN_ID)
    return interaction.reply({ content: "❌ مش مسموح", ephemeral: true });

  /* ===== ADD VIDEO ===== */
  if (interaction.commandName === "addvideo") {
    const title = interaction.options.getString("title");
    const youtube = interaction.options.getString("youtube");
    const description = interaction.options.getString("description");
    const linksRaw = interaction.options.getString("links");
    const links = linksRaw ? linksRaw.split(",").map(l => l.trim()) : [];

    const videos = await fs.readJson(DATA_FILE);
    const code = Date.now().toString();

    const videoData = {
      code,
      name: title,
      videoLink: youtube,
      description,
      developer: "MrMoundo",
      description2: "",
      links
    };

    videos.push(videoData);
    await fs.writeJson(DATA_FILE, videos, { spaces: 2 });

    // ===== Embed =====
const embed = new EmbedBuilder()
  .setTitle(`🎬 ${title}`)
  .setDescription(description)
  .setColor(0xff0000) // أحمر
  .setImage(`https://img.youtube.com/vi/${youtube.split("v=")[1]?.split("&")[0] || youtube.split("youtu.be/")[1]}/maxresdefault.jpg`)
  .addFields(
    {
      name: "▶️ مشاهدة الفيديو",
      value: `[اضغط هنا لمشاهدة الفيديو](${youtube})`,
      inline: false
    }
  )
  .setFooter({
    text: "Chillaxy Store • New Video",
    iconURL: "https://i.imgur.com/9Y6YFQK.png" // أي أيقونة بسيطة (اختياري)
  })
  .setTimestamp();


  /* ===== DELETE VIDEO ===== */
  if (interaction.commandName === "deletevideo") {
    const code = interaction.options.getString("code");
    let videos = await fs.readJson(DATA_FILE);

    const before = videos.length;
    videos = videos.filter(v => v.code !== code);

    if (videos.length === before)
      return interaction.reply("❌ الكود مش موجود");

    await fs.writeJson(DATA_FILE, videos, { spaces: 2 });
    interaction.reply("🗑️ الفيديو اتمسح");
  }
});

client.login(process.env.BOT_TOKEN);

