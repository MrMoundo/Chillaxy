import {
  Client,
  GatewayIntentBits,
  SlashCommandBuilder,
  REST,
  Routes,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
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
      o.setName("description").setDescription("Video description").setRequired(true)
    )
    .addStringOption(o =>
      o.setName("links").setDescription("Extra links separated by comma").setRequired(false)
    )
].map(c => c.toJSON());

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);
await rest.put(
  Routes.applicationCommands(process.env.CLIENT_ID),
  { body: commands }
);

client.once("ready", () => {});

client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;
  if (interaction.user.id !== ADMIN_ID) {
    return interaction.reply({ content: "Access denied.", ephemeral: true });
  }

  if (interaction.commandName === "addvideo") {
    const title = interaction.options.getString("title");
    const youtube = interaction.options.getString("youtube");
    const description = interaction.options.getString("description");
    const linksRaw = interaction.options.getString("links");

    const links = linksRaw ? linksRaw.split(",").map(l => l.trim()) : [];
    const videos = await fs.readJson(DATA_FILE);
    const code = Date.now().toString();

    videos.push({
      code,
      name: title,
      videoLink: youtube,
      description,
      developer: "MrMoundo",
      description2: "",
      links
    });

    await fs.writeJson(DATA_FILE, videos, { spaces: 2 });

    const videoId =
      youtube.includes("v=")
        ? youtube.split("v=")[1].split("&")[0]
        : youtube.split("youtu.be/")[1];

    const embed = new EmbedBuilder()
      .setTitle(`🎬 ${title}`)
      .setDescription(description)
      .setColor(0xff0000)
      .setThumbnail(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`)
      .setFooter({
        text: "Chillaxy • Official Release"
      })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel("Watch on YouTube")
        .setStyle(ButtonStyle.Link)
        .setURL(youtube)
    );

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (channel) {
      await channel.send({
        content: youtube,
        embeds: [embed],
        components: [row],
        allowedMentions: { parse: [] }
      });
    }

    interaction.reply({ content: "Video published successfully.", ephemeral: true });
  }
});

client.login(process.env.BOT_TOKEN);
