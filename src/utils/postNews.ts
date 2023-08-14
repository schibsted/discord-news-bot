import { Client } from "discord.js";
import {
  articleEmbedBuilder,
  liveEmbedBuilder,
  videoEmbedBuilder,
} from "./buildContentEmbed";
import { Item } from "../types";
import logger from "./logger";
import getChannel from "./getChannel";

const postNews = async (client: Client, item: Item): Promise<string> => {
  logger.info(`Preparing to post item ${item.id} to Discord`);

  const channel = getChannel(client);
  let embed;

  switch (item.type) {
    case "article":
      embed = articleEmbedBuilder(item);
      break;
    case "direkte":
      embed = liveEmbedBuilder(item);
      break;
    case "video":
      embed = videoEmbedBuilder(item);
      break;
    default:
      logger.error(item, `Unknown item type, unable to post.`);
      return ""; // exit early for unknown types
  }

  const msg = await channel.send({ embeds: [embed] });

  if (item.newsValue >= 10) {
    logger.info(`Crossposting ${item.id} due to newsValue`);
    msg.crosspost();
  }

  logger.info(`Posted ${item.id} to Discord with id ${msg.id}`);
  return msg.id;
};

export default postNews;
