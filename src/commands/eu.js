const { super_message }  = require("../functions/super_message.js");
const { prefix } = require("../config.json");

module.exports = {
    name: "eu",
    description: "Report a Super Mob to the EU region.",
    longDescription: "When running the command, the bot will react with \`✅\` to confirm the report has been sent through. If the bot reacts with \`❌\`, this means the report has already been sent by someone else.",
    aliases: ["e"],
    usage: [`${prefix}eu <mob>`],
    async execute(client, message, args) {
        let mob = args.join(" ");
        if (!mob) return;

        await super_message(client, message, mob, "eu");
    }
};