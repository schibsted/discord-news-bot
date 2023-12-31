import "dotenv/config";
import cron from "node-cron";
import { Client, Collection, Events, GatewayIntentBits, Interaction, SlashCommandBuilder } from "discord.js";
import { createClient } from "redis";

import getLatestNews from "./utils/getLatestNews";
import logger from "./utils/logger";
import getChannel from "./utils/getChannel";
import cleanup from "./jobs/cleanupMessages";
import editMessages from "./jobs/editMessages";
import postMessages from "./jobs/postMessages";
import * as fs from "fs";

// Create discord client
interface ClientWithCommands extends Client {
  commands: Collection<string, any>
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
}) as ClientWithCommands;

// Configure redis client
export const redisClient = createClient({
  url: process.env["REDIS_URL"] || "",
});

// Used to skip posting of news on first run
let firstRun = true;

// Register ready event and start cron jobs
client.once(Events.ClientReady, async (c) => {
  logger.info(`Ready! Logged in as ${c.user.tag}`);

  await c.user.setActivity('the news', { type: 3 });

  logger.info("Connecting to redis");
  await redisClient.connect();
  logger.info("Connected to redis");

  const channel = getChannel(client);

  logger.info(
    `Found channel ${channel.name} (${channel.id}), ready to begin work!`
  );

  cron.schedule("* * * * *", async () => {
    logger.info("Running cron job");
    const latestNews = await getLatestNews();

    if (!latestNews.length)
      return logger.error(
        "No news found while trying to cleanup/edit messages"
      );

    logger.debug(`Found ${latestNews.length} news items`);

    logger.info("Running cleanup job");
    await cleanup(client, latestNews);
    logger.info("Finished cleanup job");

    logger.info("Running edit job");
    await editMessages(client, latestNews);
    logger.info("Finished edit job");

    logger.info("Running post job");
    await postMessages(client, latestNews, firstRun);
    logger.info("Finished post job");

    firstRun = false;
    logger.info("Finished cron job");
  });
});

interface SlashCommandDefinition {
  data: SlashCommandBuilder;
  execute: Function;
}

// Slash command handler
client.commands = new Collection<string, SlashCommandDefinition>();
try {
  const registerSlashCommandFolders: string[][] = [
    ['news']
  ];

  for (let registerSlashCommandFolder of registerSlashCommandFolders) {
    const commandFiles = fs.readdirSync(__dirname + '/commands/' + registerSlashCommandFolder)
        .filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require('./commands/' + registerSlashCommandFolder + '/' + file);
      client.commands.set(command.name, command);
    }
  }
} catch (e) {
  logger.error(e, 'Could not load slash commands')
}

client.on(Events.InteractionCreate, async (interaction: Interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  const slashCommand = client.commands.get(commandName);
  if (!slashCommand) return;

  try {
    await slashCommand.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'Well that didn\'t work, try another command maybe?', ephemeral: true });
  }
});

// Login to discord
client.login(process.env["DISCORD_TOKEN"]);

// Register error handlers for redis client
redisClient.on("error", (err) => logger.error(err, "Redis Client Error"));

// Register error handlers for discord client
client.on(Events.Error, (err) => logger.error(err, "Discord Client Error"));
client.on(Events.ShardError, (err) =>
  logger.error(err, "Discord Client Shard Error")
);

// Graceful shutdown
process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down");
  await redisClient.quit();
  await client.destroy();
  process.exit(0);
});
