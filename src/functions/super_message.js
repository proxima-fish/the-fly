const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags } = require("discord.js");
const { mobs } = require("../mob_files/mob_list.json");
const { format_string } = require("../functions/format_string");
const { ping_channel, na_role, eu_role, as_role, max_fakes } = require("../config.json");
const { match_mob_name } = require("../functions/match_mob_name");
const { get_servers } = require("../m28_api/m28_api");

function strip_server_ids(servers) {
    server_ids = [];
    for (const [key, value] of Object.entries(servers)) {
        server_ids.push(key);
    }
    ids = server_ids.join("  	");
    return ids;
}

exports.super_message = async (client, message, mob, region) => {
    // To do: React with :x: for duplicate reports
    await message.react("✅");

    mob = match_mob_name(mob);

    let file_name = mob.replaceAll(" ", "_");
    let image = `src/assets/mobs/${file_name}.png`;

    let channel = await client.channels.fetch(ping_channel);

    let maps = mobs.find(m => m["name"] === mob).maps;
    // get_servers(filters)
    let embed = new EmbedBuilder()
        .setTitle(`A \`Supper ${format_string(mob)}\` but spend in \`${region.toUpperCase()}\`!`)
        .setThumbnail(`attachment://${file_name}.png`)
        .setDescription(`> **Raw Message:** \`${message.content}\`\n\n${maps.map(map => `**${format_string(map)}**\n\`\`\`${strip_server_ids(get_servers([region, map]))}\`\`\``).join("\n")}`)
        .setFooter({ text: `Reported from ${message.guild.name}.`, iconURL: message.guild.iconURL() })

    let ping_role;
    if (region === "na") ping_role = na_role;
    else if (region === "eu") ping_role = eu_role;
    else if (region === "as") ping_role = as_role;

    const button = new ButtonBuilder()
        .setCustomId(`fake-${message.id}`)
        .setLabel("Mark as Fake")
        .setStyle(ButtonStyle.Danger)
    const row = new ActionRowBuilder().addComponents(button);

    await channel.send({
        content: `A Supper ${format_string(mob)} but spend in ${region.toUpperCase()} | <@&${ping_role}>`,
        embeds: [embed],
        files: [image],
        components: [row],
        tts: true
    });

    let fakeReports = [];
    client.on("interactionCreate", async (interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === `fake-${message.id}`) {
            if (fakeReports.includes(interaction.user.id)) return await interaction.reply({ content: "❌ You have already marked this report as fake!", flags: MessageFlags.Ephemeral });
            fakeReports.push(interaction.user.id)

            let content = `A Supper ${format_string(mob)} but spend in ${region.toUpperCase()} | <@&${ping_role}>`;
            if (fakeReports.length === max_fakes) {
                button.setDisabled(true);
                content = `❌ **[FAKE]** ~~ A Supper ${format_string(mob)} but spend in ${region.toUpperCase()} | <@&${ping_role}>~~`;
            }

            embed.setFields({ name: `Marked as fake \`${fakeReports.length}/${max_fakes}\``, value: fakeReports.map(user => `> <@${user}>`).join("\n") });

            if (fakeReports.length === max_fakes) fakeReports = [];

            await interaction.update({
                content: content,
                embeds: [embed],
                files: [image],
                components: [row]
            });
        }
    });
}