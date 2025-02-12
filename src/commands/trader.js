const { trader_message } = require("../functions/trader_message.js");
const { prefix } = require("../config.json");

module.exports = {
    name: "trader",
    description: "Report the Trader's location in the desert.",
    aliases: ["t"],
    usage: [`${prefix}trader <region>`],
    async execute(client, message, args) {
        let region = args.join(" ");
        if (!region || !["na", "n", "u", "us", "e", "eu", "a", "as", "asia"].includes(region)) return;

        await trader_message(client, message, region);
    }
};