import { Item } from "../types";
import logger from "./logger";

const APIUrl = "https://www.vg.no/feed/latest";

const getLatestNews = async (): Promise<Array<Item>> => {
  const queryParams = {
    limit: "50",
    cacheBust: new Date().getTime().toString(),
  };

  try {
    const response = await fetch(
      `${APIUrl}?${new URLSearchParams(queryParams)}`
    );

    if (!response.ok) {
      logger.error(
        new Error(
          `Error fetching news: Received ${response.status} ${response.statusText}`
        )
      );
      return [];
    }

    const data = (await response.json()) as Array<Item>;
    return data;
  } catch (error) {
    logger.error(error, `Failed to fetch latest news`);
    return [];
  }
};

export default getLatestNews;
