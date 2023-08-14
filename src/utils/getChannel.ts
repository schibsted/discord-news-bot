import { ChannelType, Client, GuildTextBasedChannel } from "discord.js";
import logger from "./logger";

const channelId = process.env["DISCORD_CHANNEL_ID"] || "";

const getChannel = (client: Client): GuildTextBasedChannel => {
  const channel = client.channels.cache.get(channelId);

  if (!channel?.isTextBased()) {
    logger.fatal("Channel is not a text channel");
    return process.exit(1);
  }

  if (channel.type !== ChannelType.GuildText) {
    logger.fatal(`Channel is not a guild text channel: ${channel.type}`);
    return process.exit(1);
  }

  return channel;
};

export default getChannel;
