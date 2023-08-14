import { EmbedBuilder } from "discord.js";
import { Article, LiveBlog, Video } from "../types";

export const articleEmbedBuilder = (item: Article): EmbedBuilder => {
  const fields = [
    {
      name: "Type",
      value: "Artikkel",
      inline: true,
    },
  ];

  if (item.tag) {
    fields.push({
      name: "Kategori",
      value: item.tag,
      inline: true,
    });
  }

  return new EmbedBuilder()
    .setTitle(item.title)
    .setURL(item.url)
    .setDescription(item.description)
    .setTimestamp(item.published)
    .setImage(item.images[0]?.url || null)
    .setColor("#db0000")
    .setFields(fields);
};

export const liveEmbedBuilder = (item: LiveBlog): EmbedBuilder =>
  new EmbedBuilder()
    .setTitle(item.title)
    .setURL(item.url)
    .setTimestamp(item.published)
    .setColor("#db0000")
    .setFields([
      {
        name: "Type",
        value: "Nyhetsdøgnet",
        inline: true,
      },
    ]);

export const videoEmbedBuilder = (item: Video): EmbedBuilder =>
  new EmbedBuilder()
    .setTitle(item.title)
    .setURL(item.url)
    .setDescription(item.description)
    .setTimestamp(item.published)
    .setImage(item.images.front || item.images.main || null)
    .setColor("#db0000")
    .setFields([
      {
        name: "Kategori",
        value: item.tag,
        inline: true,
      },
      {
        name: "Type",
        value: "Video",
        inline: true,
      },
    ]);
