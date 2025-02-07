const { super_message }  = require("../functions/super_message.js");
const { mobs } = require("../mob_files/mob_list.json");

module.exports = {
    name: "as",
    description: "Report a Super Mob in AS region.",
    aliases: ["a"],
    async execute(client, message, args) {
        let mob = args[0];
        if (!mob) return;

        if (mobs.find(m => m.name === mob)) await super_message(client, message, mob, "as");
    }
};