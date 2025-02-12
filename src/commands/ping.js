module.exports = {
    name: "ping",
    description: "Returns The Fly's latency.",
    aliases: ["p"],
    usage: [],
    async execute(client, message) {
        let msg = await message.channel.send({ content: `>>> Client: ${client.ws.ping}ms\nRoundtrip: Pinging...`});
        await msg.edit({ content: `>>> Client: ${client.ws.ping}ms\nRoundtrip: ${msg.createdTimestamp - message.createdTimestamp}ms`});
    }
};