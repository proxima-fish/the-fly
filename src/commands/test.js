const { match_mob_name } = require("../functions/match_mob_name");

module.exports = {
    name: "test",
    description: "Tests The Fly's autocorrect / string matching.",
    aliases: ["t"],
    async execute(client, message, args) {
        let mob = args.join(" ");
       
        mob = match_mob_name(mob);
        await message.channel.send({ content: `> Chosen match: ${mob}`});
    }
};