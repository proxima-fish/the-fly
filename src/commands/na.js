const { super_message }  = require("../functions/super_message.js");
const { mobs } = require("../mob_files/mob_list.json");

module.exports = {
    name: "na",
    description: "Report a Super Mob in NA region.",
    aliases: ["n", "u", "us"],
    async execute(client, message, args) {
        let mob = args.join(" ");
        if (!mob) return;

        if (mobs.find(m => m.name === mob)) await super_message(client, message, mob, "na");
    }
};