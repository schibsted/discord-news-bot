import { Client, RESTJSONErrorCodes } from "discord.js";
import { redisClient } from "..";
import { Item } from "../types";
import logger from "../utils/logger";
import getChannel from "../utils/getChannel";

const cleanupMessages = async (client: Client, latestNews: Array<Item>) => {
  const keys = await redisClient.keys("*");
  const channel = getChannel(client);

  logger.debug(`Found ${keys.length} items in database`);

  for (const key of keys) {
    const item = await redisClient.get(key);
    if (!item) return;

    const parsedItem = JSON.parse(item) as { item: Item; msgId: string };

    const foundItem = latestNews.find((i) => i.id === parsedItem.item.id);

    if (!foundItem) {
      if (!parsedItem.msgId) {
        logger.warn(
          `Item ${parsedItem.item.id} is no longer in latest news, but has no message id, only deleting database entry`
        );
        await redisClient.del(key);

        continue;
      }

      logger.info(
        `Item ${parsedItem.item.id} is no longer in latest news, deleting message and database entry`
      );

      await channel?.messages
        .fetch(parsedItem.msgId)
        .then((msg) => msg.delete())
        .catch((err) => {
          if (err.code === RESTJSONErrorCodes.UnknownMessage) return;

          logger.error(err, `Error deleting message ${parsedItem.msgId}`);
        });
      await redisClient.del(key);
    }
  }
};

export default cleanupMessages;
