const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const fs = require("node:fs");
const { format_string } = require("../functions/format_string.js");
const { ping_channel, max_fakes, trader_role } = require("../config.json");
const { get_servers } = require("../m28_api/m28_api");

function strip_server_ids(servers) {
    server_ids = [];
    for (const [key, value] of Object.entries(servers)) {
        server_ids.push(`cp6.forceServerID("${key}")`);
    }
    ids = server_ids.join("\n");
    return ids;
}

exports.trader_message = async (client, message, region) => {
    let default_grid = `src/assets/trader/desert_grid.png`;

    let format_region = {
        "na": "na",
        "n": "na",
        "u": "na",
        "us": "na",
        "e": "eu",
        "eu": "eu",
        "a": "as",
        "asia": "as",
        "as": "as",
    };

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

    let msg = await message.channel.send({
        embeds: [
            new EmbedBuilder()
                .setTitle(`\`${format_region[region].toUpperCase()}\` Trader Report.`)
                .setDescription("Provide the coordinate corresponding to the Trader's location on the map.")
                .setImage(`attachment://desert_grid.png`)
                .setFooter({ text: 'You have 30s to send a coordinate. To cancel the report, type "cancel.' })
        ],
        files: [default_grid],
    });

    let files = fs.readdirSync("./src/assets/trader");
    const filter = (m) => m.author.id === message.author.id && files.includes(`${m.content.toLowerCase()}.png`) && m.content !== "desert_grid" || m.content === "cancel";
    const collector = message.channel.createMessageCollector({ filter: filter, time: 30_000 });

    let embed = new EmbedBuilder();
    let content;
    let channel = await client.channels.fetch(ping_channel);
    let location;
    let trader_msg;
    let coords;
    let msg_url;

    collector.on("collect", async (m) => {
        if (m.content === "cancel") return collector.stop("cancelled");

        coords = m;
        msg_url = m.url;
        location = `src/assets/trader/${m.content.toLowerCase()}.png`;
        content = `\`${format_region[region].toUpperCase()}\` Trader at \`${m.content.toUpperCase()}\` | 🚨 <@&${trader_role}>`;

        embed.setTitle(`The \`${format_region[region].toUpperCase()}\` Trader has been spotted at \`${m.content.toUpperCase()}\`!`)
            .setImage(`attachment://${m.content.toLowerCase()}.png`)
            .setDescription(`> **Raw Message:** \`${message.content}\` | \`${m.content}\`\n> **Message Link:** ${message.url} | ${m.url}\n> **Note:** \`No note has been added.\`\n\n**${format_string("desert")}**\n\`\`\`js\n${strip_server_ids(get_servers([region, "desert"]))}\`\`\``)
            .setFooter({ text: `Reported from ${message.guild.name}.`, iconURL: message.guild.iconURL() })
            .setTimestamp()

        trader_msg = await channel.send({
            content: content,
            embeds: [embed],
            files: [location],
            components: [row],
            tts: true
        });

        await m.react("✅");
        collector.stop("fulfilled");
    });

    collector.on("end", async (collected, reason) => {
        if (reason === "fulfilled") {
            await msg.delete();
        } else if (reason === "time" || "cancelled") {
            await msg.delete();
            await message.react("❌");
        } 
    });

    let fakeReports = [];
    client.on("interactionCreate", async (interaction) => {
        if (interaction.customId === `fake-${message.id}`) {
            if (fakeReports.includes(interaction.user)) return await interaction.reply({ content: "❌ You have already marked this report as fake!", flags: MessageFlags.Ephemeral });
            fakeReports.push(interaction.user);
            if (fakeReports.length === max_fakes) {
                fakeButton.setDisabled(true);
                noteButton.setDisabled(true);
                content = `❌ **[FAKE]** ~~\`${format_region[region].toUpperCase()}\` Trader at \`${coords.toUpperCase()}\` | 🚨 <@&${trader_role}>~~`;
            }

            embed.setFields({ name: `Marked as fake \`${fakeReports.length}/${max_fakes}\``, value: fakeReports.map(user => `> \`${user.username}\` (<@${user.id}>)`).join("\n") });

            if (fakeReports.length === max_fakes) fakeReports = [];

            await interaction.update({
                content: content,
                embeds: [embed],
                files: [location],
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
                embed.setDescription(`> **Raw Message:** \`${message.content}\` | \`${coords}\`\n> **Message Link:** ${message.url} | ${msg_url}\n> **Note:** \`${note}\`\n\n**${format_string("desert")}**\n\`\`\`js\n${strip_server_ids(get_servers([region, "desert"]))}\`\`\``)

                await trader_msg.edit({
                    content: content,
                    embeds: [embed],
                    files: [location],
                    components: [row]
                });

                await i.editReply({ content: "✅ Note edited!" });
            }).catch(err => { console.log(err) });
        }
    });
};