import { ChannelType, Client, NewsChannel } from "discord.js";
import logger from "./logger";

const channelId = process.env["DISCORD_CHANNEL_ID"] || "";

const getChannel = (client: Client): NewsChannel => {
  const channel = client.channels.cache.get(channelId);

  if (!channel?.isTextBased()) {
    logger.fatal("Channel is not a text channel");
    return process.exit(1);
  }

  if (channel.type !== ChannelType.GuildAnnouncement) {
    logger.fatal("Channel is a announcement channel");
    return process.exit(1);
  }

  return channel;
};

export default getChannel;
