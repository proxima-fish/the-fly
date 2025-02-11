const { EmbedBuilder } = require("discord.js");
const { get_servers } = require("../m28_api/m28_api");

module.exports = {
  name: "lobbies",
  description: "Enumerate known servers",
  aliases: ["l"],
  async execute(client, message, args) {
    let args_string = args.join(" ");
    servers = get_servers(args);
    server_ids = [];
    for (const [key, value] of Object.entries(servers)) {
      server_ids.push(`cp6.forceServerID("${key}")`);
    }
    ids = server_ids.join("\n");

    let embed = new EmbedBuilder()
      .setTitle(`Servers for \`${args_string}\`:`)
      .setDescription(`\`\`\`js\n${ids}\`\`\``)

    await message.channel.send({
      embeds: [embed]
    });
  }
};
