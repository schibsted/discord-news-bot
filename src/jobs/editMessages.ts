import { Client, EmbedBuilder, RESTJSONErrorCodes } from "discord.js";
import equal from "deep-equal";
import {
  articleEmbedBuilder,
  liveEmbedBuilder,
  videoEmbedBuilder,
} from "../utils/buildContentEmbed";
import logger from "../utils/logger";
import getChannel from "../utils/getChannel";
import { redisClient } from "..";
import { Item } from "../types";

const editMessages = async (
  client: Client,
  latestNews: Array<Item>
): Promise<void> => {
  for (const item of latestNews) {
    const savedItem = await redisClient.get(String(item.id));
    if (!savedItem) continue;
    const { msgId, item: oldItem } = JSON.parse(savedItem);

    const equalMessages = equal(item, oldItem);

    if (equalMessages) {
      logger.trace(
        `Item ${item.id} is the same as saved version, skipping editing`
      );
      continue;
    }

    if (!msgId) {
      logger.info(`Item ${item.id} has no message id, skipping editing`);

      await redisClient.set(
        String(item.id),
        JSON.stringify({ item: item, msgId })
      );

      continue;
    }

    logger.info(`Item ${item.id} has been edited, updating message`);

    const channel = getChannel(client);

    logger.debug("found channel");
    let embed: EmbedBuilder;

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
        logger.error(item, `Unknown item type when trying to edit message`);
        continue;
    }

    logger.debug("finished creating embed");

    await channel.messages
      .fetch(msgId)
      .then(async (msg) => {
        logger.debug("fetched message");
        await msg.edit({ embeds: [embed] }).catch((err) => {
          if (err.code === RESTJSONErrorCodes.UnknownMessage) {
            logger.error(
              `Error editing message for item ${item.id}, message not found. Deleting database entry`
            );
            redisClient.del(String(item.id));
            return;
          }

          return logger.error(
            err,
            `Failed to edit message for item ${item.id}`
          );
        });
        if (oldItem.newsValue < 50 && item.newsValue >= 50) {
          logger.info(`Crossposted ${item.id} due to newsValue change to 80+`);
          msg.crosspost();
        }
      })
      .catch((err) => {
        if (err.code === RESTJSONErrorCodes.UnknownMessage) {
          logger.error(
            `Error editing message for item ${item.id}, message not found. Deleting database entry`
          );
          redisClient.del(String(item.id));
          return;
        }

        return logger.error(err, `Failed to edit message for item ${item.id}`);
      });

    await redisClient.set(
      String(item.id),
      JSON.stringify({ item: item, msgId })
    );

    logger.info(`Edited ${item.type} on Discord with id ${item.id}`);
  }
};

export default editMessages;
