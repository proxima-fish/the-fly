module.exports = {
    name: "ping",
    description: "Returns The Fly's latency.",
    aliases: ["p"],
    async execute(client, message) {
        await message.channel.send({ content: `> Client: ${client.ws.ping}ms`});
    }
};