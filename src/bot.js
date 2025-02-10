const { Client, Collection } = require("discord.js");
const { token, prefix } = require("./config.json");
const { start_scrape } = require("./m28_api/m28_api");

const client = new Client({ intents: 3276799 });

client.commands = new Collection();
client.events = new Collection();

client.once("ready", async () => console.log(`Logged in as ${client.user.username}.`));

client.on("messageCreate", async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    let args = message.content.slice(prefix.length).trim().split(/ +/g);
    let cmd = args.shift().toLowerCase();

    const command = client.commands.get(cmd) || client.commands.find(a => a.aliases && a.aliases.includes(cmd));
    if (command) {
        try {
            command.execute(client, message, args, cmd);
        } catch (e) {
            message.channel.send(`An error has occured during \`${cmd}\` execution: \`${e}\``)
        }
    }
});

process.on('uncaughtException', async (err) => {
    console.error('Uncaught Exception:', err.message);
    console.error(err.stack);
});

process.on("unhandledRejection", async (err) => {
    console.error("Unhandled Rejection", err)
});

(async () => {
    require("./cmd_handler")(client);
    client.login(token);
})();

start_scrape();