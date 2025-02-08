const { super_message }  = require("../functions/super_message.js");

module.exports = {
    name: "as",
    description: "Report a Super Mob in AS region.",
    aliases: ["a", "asia"],
    async execute(client, message, args) {
        let mob = args.join(" ");
        if (!mob) return;

        await super_message(client, message, mob, "as");
    }
};