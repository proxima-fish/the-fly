const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { mobs } = require("../mob_files/mob_list.json");
const { format_string } = require("../functions/format_string");
const { ping_channel, na_role, eu_role, as_role, max_fakes } = require("../config.json");
const { match_mob_name } = require("../functions/match_mob_name");
const { get_servers } = require("../m28_api/m28_api");

function strip_server_ids(servers) {
    server_ids = [];
    for (const [key, value] of Object.entries(servers)) {
        server_ids.push(`cp6.forceServerID("${key}")`);
    }
    ids = server_ids.join("\n");
    return ids;
}

let lastMob = ``;
let lastReported = 0;
let lastRegion = ``;
exports.super_message = async (client, message, mob, region) => {
    let ratelimit = 180_000;
    if (ratelimit - ((Date.now() / 1000) - lastReported) > 0 && mob === lastMob && region === lastRegion) return await message.react("❌");

    await message.react("✅");
    lastMob = mob;
    lastReported = Date.now() / 1000;
    lastRegion = region;

    mob = match_mob_name(mob);

    let file_name = mob.replaceAll(" ", "_");
    let image = `src/assets/mobs/${file_name}.png`;

    let channel = await client.channels.fetch(ping_channel);

    let maps = mobs.find(m => m["name"] === mob).maps;
    // get_servers(filters)
    let embed = new EmbedBuilder()
        .setTitle(`A \`Supper ${format_string(mob)}\` but spend in \`${region.toUpperCase()}\`!`)
        .setThumbnail(`attachment://${file_name}.png`)
        .setDescription(`> **Raw Message:** \`${message.content}\`\n> **Message Link:** ${message.url}\n> **Note:** \`No note has been added.\`\n\n${maps.map(map => `**${format_string(map)}**\n\`\`\`js\n${strip_server_ids(get_servers([region, map]))}\`\`\``).join("\n")}`)
        .setFooter({ text: `Reported from ${message.guild.name}.`, iconURL: message.guild.iconURL() })
        .setTimestamp()

    let ping_role;
    if (region === "na") ping_role = na_role;
    else if (region === "eu") ping_role = eu_role;
    else if (region === "as") ping_role = as_role;

    const fakeButton = new ButtonBuilder()
        .setCustomId(`fake-${message.id}`)
        .setLabel("Mark as Fake")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("❌")
    const noteButton = new ButtonBuilder()
        .setCustomId(`note-${message.id}`)
        .setLabel("Add Note")
        .setStyle(ButtonStyle.Secondary)
        .setEmoji("🗒️")

    const row = new ActionRowBuilder().addComponents(fakeButton, noteButton);

    let content = `A Supper ${format_string(mob)} but spend in ${region.toUpperCase()} | 🚨 <@&${ping_role}>`;
    const msg = await channel.send({
        content: content,
        embeds: [embed],
        files: [image],
        components: [row],
        tts: true
    });

    let fakeReports = [];
    client.on("interactionCreate", async (interaction) => {
        if (interaction.customId === `fake-${message.id}`) {
            if (fakeReports.includes(interaction.user.id)) return await interaction.reply({ content: "❌ You have already marked this report as fake!", flags: MessageFlags.Ephemeral });
            fakeReports.push(interaction.user)

            if (fakeReports.length === max_fakes) {
                button.setDisabled(true);
                content = `❌ **[FAKE]** ~~ A Supper ${format_string(mob)} but spend in ${region.toUpperCase()} | 🚨 <@&${ping_role}>~~`;
            }

            embed.setFields({ name: `Marked as fake \`${fakeReports.length}/${max_fakes}\``, value: fakeReports.map(user => `> \`${user.username}\` (<@${user.id}>)`).join("\n") });

            if (fakeReports.length === max_fakes) fakeReports = [];

            await interaction.update({
                content: content,
                embeds: [embed],
                files: [image],
                components: [row]
            });
        } else if (interaction.customId === `note-${message.id}`) {
            if (interaction.user.id !== message.author.id) return await interaction.reply({ content: "❌ You cannot add a note to this report! You can only add notes to mobs that you reported.", flags: MessageFlags.Ephemeral });

            const noteModal = new ModalBuilder()
                .setCustomId(`noteModal-${interaction.id}`)
                .setTitle("Add a note to this report.")

            const noteInput = new TextInputBuilder()
                .setCustomId("note-input")
                .setLabel("You can change this note whenever.")
                .setStyle(TextInputStyle.Paragraph)
                .setMaxLength(250)

            noteModal.addComponents(new ActionRowBuilder().addComponents(noteInput));
            await interaction.showModal(noteModal);

            await interaction.awaitModalSubmit({
                filter: async (int) => {
                    let filter = (int) => int.user.id === interaction.user.id && int.customId === `noteModal-${interaction.id}`;
                    if (filter) {
                        await int.deferReply({ flags: MessageFlags.Ephemeral });
                    }
                    return filter;
                },
                time: 600_000
            }).then(async (i) => {
                let note = i.fields.getTextInputValue("note-input");
                embed.setDescription(`> **Raw Message:** \`${message.content}\`\n> **Message Link:** ${message.url}\n> **Note:** \`${note}\`\n\n${maps.map(map => `**${format_string(map)}**\n\`\`\`js\n${strip_server_ids(get_servers([region, map]))}\`\`\``).join("\n")}`);

                await msg.edit({
                    content: content,
                    embeds: [embed],
                    files: [image],
                    components: [row]
                });

                await i.editReply({ content: "✅ Note edited!" });
            }).catch(err => { return });
        }
    });
}