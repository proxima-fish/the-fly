const { get_servers } = require("../m28_api/m28_api");

module.exports = {
  name: "lobbies",
  description: "Enumerate known servers",
  aliases: ["l"],
  async execute(client, message, args) {
    servers = get_servers(args);
    await message.channel.send({ content: JSON.stringify(servers)});
  }
};