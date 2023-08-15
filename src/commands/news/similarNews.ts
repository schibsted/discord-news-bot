import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { AIResponseType } from "../../types";

const data = new SlashCommandBuilder()
    .setName('similarnews')
    .setDescription('Get similar news')
    .addStringOption(option => (
        option.setName('search-similarity')
            .setDescription('Enter search similarity')
            .addChoices(
                {
                    name: 'Vg articles (recommended)',
                    value: 'vg_articles_ada'
                })
            .setRequired(true)))
    .addStringOption(option => (
        option.setName('articletitle')
            .setDescription('Enter article title')
            .setRequired(true)))
    .addIntegerOption(option => (
        option.setName('limit')
            .setDescription('Limit on how many articles to show')
            .setMinValue(1)
            .setMaxValue(3)
            .setRequired(true)))

module.exports = {
    data: data,
    name: 'similarnews',
    execute: async (interaction: ChatInputCommandInteraction)=> {
        const searchSimilarity: string | null = interaction.options.getString('search-similarity');
        const articleTitle: string | null = interaction.options.getString('articletitle');
        const limit: number | null = interaction.options.getInteger('limit');

        await interaction.deferReply({ ephemeral: true });

        const response: Response = await fetch(`${process.env['VG_AI_URL']}/similarity_search/${searchSimilarity}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: articleTitle,
                limit: limit
            }),
        });

        if (response.status === 200) {
            const data = await response.json();

            let embeds: object[] = [];

            data.forEach((element: AIResponseType) => {
                embeds.push({
                    title: element.metadata.title,
                    url: `https://www.vg.no/i/${element.metadata.id}`,
                    description: element.text.length > 256 ? element.text.substring(0, 256) + '...' : element.text,
                    color: 0xff0000,
                    timestamp: new Date(),
                    footer: {
                        text: 'VG',
                    },
                });
            });

            await interaction.editReply({ embeds: embeds });
        } else {
            const embed = {
                title: 'Noe gikk galt',
                description: 'Prøv igjen senere',
                color: 0xff0000,
                timestamp: new Date().toISOString(),
                footer: {
                    text: 'VG',
                }
            }

            await interaction.reply({ embeds: [embed], ephemeral: true });
        }
    }
}
