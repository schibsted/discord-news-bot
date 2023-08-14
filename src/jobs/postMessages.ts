import { Client } from "discord.js";
import { Item } from "../types";
import logger from "../utils/logger";
import { redisClient } from "..";
import postNews from "../utils/postNews";

const postMessages = async (
  client: Client,
  latestNews: Array<Item>,
  firstRun: boolean
): Promise<void> => {
  for (const item of latestNews) {
    try {
      const savedItem = await redisClient.get(String(item.id));

      // If the item has already been seen, skip further processing for this item
      if (savedItem) {
        logger.debug(`Item already seen before: ${item.id}`);
        continue;
      }

      // If it's the first run, just save the item without posting it
      if (firstRun) {
        logger.debug(`Save only on first run: ${item.id}`);
        await redisClient.set(
          String(item.id),
          JSON.stringify({ item: item, msgId: null })
        );
        continue;
      }

      const msgId = await postNews(client, item);

      // Save the item to redis so we don't post it again
      await redisClient.set(
        String(item.id),
        JSON.stringify({ item: item, msgId })
      );
    } catch (err) {
      logger.error(err, `Failed processing item ${item.id}`);
    }
  }
};

export default postMessages;
