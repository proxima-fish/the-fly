const { super_message }  = require("../functions/super_message.js");

module.exports = {
    name: "na",
    description: "Report a Super Mob in NA region.",
    aliases: ["n", "u", "us"],
    async execute(client, message, args) {
        let mob = args.join(" ");
        if (!mob) return;

        await super_message(client, message, mob, "na");
    }
};