const { EmbedBuilder } = require("discord.js");
const { get_servers } = require("../m28_api/m28_api");
const { prefix } = require("../config.json");

module.exports = {
  name: "lobbies",
  description: "Enumerate known servers",
  aliases: ["l", "servers"],
  usage: [`${prefix}lobbies {filters}`],
  async execute(client, message, args) {
    servers = get_servers(args);
    if (Object.entries(servers).length === 0) return await message.channel.send({ content: "❌ Filter does not exist!"})
    server_ids = [];
    for (const [key, value] of Object.entries(servers)) {
      server_ids.push(`cp6.forceServerID("${key}")`);
    }
    ids = server_ids.join("\n");

    let formatArgs = {
      "vultr-miami": "na",
      "vultr-tokyo": "as",
      "vultr-frankfurt": "eu",
      "0": 'garden',
      "1": 'desert',
      "2": 'ocean',
      "3": 'jungle',
      "4": 'ant hell',
      "5": 'hel',
      "6": 'sewers'
    };

    let filter = args.map(a => `\`${formatArgs[a]?.toUpperCase()}\``).join(", ");

    let embed = new EmbedBuilder()
      .setTitle(`Displaying all cached servers.`)
      .setDescription(`**Filters:** ${filter || `\`None\``}\n\`\`\`js\n${ids}\`\`\``)

    await message.channel.send({
      embeds: [embed]
    });
  }
};
