const { EmbedBuilder, Embed } = require("discord.js");
const { prefix } = require("../config.json");

module.exports = {
    name: "help",
    description: "Returns The Fly's list of commands.",
    aliases: ["h"],
    usage: [`${prefix}help {command}`],
    async execute(client, message, args) {
        let c = args.join(" ");

        if (!c) {
            let commandList = client.commands.sort((a, b) => a.name.localeCompare(b.name)).map(cmd => `**\`${prefix}${cmd.name}\`**\n> ${cmd.description}\n> **Aliases:** ${cmd.aliases.map(alias => `\`${prefix}${alias}\``).join(", ")}`).join("\n");

            await message.channel.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`${client.user.username} | Command List`)
                        .setDescription(commandList)
                        .setTimestamp()
                ]
            });
        } else if (c) {
            let command = client.commands.find(cmd => cmd.name === c);
            if (!command) return await message.channel.send({ content: "❌ Command does not exist!" });

            let embed = new EmbedBuilder()
                .setTitle(`\`${prefix}${command.name}\``)
                .setDescription(`> ${command.description} ${command.longDescription || ""}`)
                .addFields({ name: "Aliases", value: command.aliases.map(alias => `\`${prefix}${alias}\``).join(", "), inline: true })
                .setTimestamp()

            if (command.usage.length > 0) embed.addFields({ name: "Usage", value: command.usage.map(u => `\`${u}\``).join("\n"), inline: true }).setFooter({ text: "<> = required, {} = optional"});
            await message.channel.send({ embeds: [embed] });
        }
    }
};