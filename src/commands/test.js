const { match_mob_name } = require("../functions/match_mob_name");
const { prefix } = require("../config.json");

module.exports = {
    name: "test",
    description: "Tests The Fly's autocorrect / string matching.",
    aliases: [],
    usage: [`${prefix}test <string>`],
    async execute(client, message, args) {
        let mob = args.join(" ");
        if (!mob) return;
       
        mob = match_mob_name(mob);
        await message.channel.send({ content: `> Chosen match: ${mob}`});
    }
};