import "dotenv/config";
import { REST, Routes } from 'discord.js'
const fs = require('node:fs');

// Place your client and guild ids here
const clientId: string = process.env['DISCORD_CLIENT_ID']!;
const guildId: string = process.env['DISCORD_SERVER_ID']!;

const rest: REST = new REST().setToken(process.env['DISCORD_TOKEN']!);
console.log(rest);

(async () => {
    try {
        const commands = [];

        const registerSlashCommandFolders = [
            ['news'],
        ];

        for (let registerSlashCommandFolder of registerSlashCommandFolders) {
            const commandFiles = fs.readdirSync(__dirname + '/commands/' + registerSlashCommandFolder)
                .filter((file: string) => file.endsWith('.js'));

            for (const file of commandFiles) {
                const command = require('./commands/' + registerSlashCommandFolder + '/' + file);
                commands.push(command.data);
            }
        }

        console.log('Started refreshing application (/) commands.');

        switch (process.env['NODE_ENV']) {
            case 'production':
                await rest.put(
                    Routes.applicationCommands(clientId),
                    { body: commands },
                );
                break;
            case 'development':
                await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commands },
                );
                break;
        }

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();
