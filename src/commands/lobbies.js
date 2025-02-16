const { EmbedBuilder } = require("discord.js");
const { get_servers } = require("../m28_api/m28_api");
const { prefix } = require("../config.json");

module.exports = {
  name: "lobbies",
  description: "Enumerate known servers",
  aliases: ["l", "servers"],
  usage: [`${prefix}lobbies {filters}`],
  async execute(client, message, args) {
    servers = get_servers(args);
    if (Object.entries(servers).length === 0) return await message.channel.send({ content: "❌ Filter does not exist!"})

    let formatArgs = {
      "vultr-miami": "na",
      "vultr-tokyo": "as",
      "vultr-frankfurt": "eu",
      "0": 'garden',
      "1": 'desert',
      "2": 'ocean',
      "3": 'jungle',
      "4": 'ant hell',
      "5": 'hel',
      "6": 'sewers'
    };

    let filters = args;
    for (let i = 0; i < filters.length; i++) {
      if (formatArgs[filters[i]]) filters[i] = formatArgs[filters[i]];
    }
    let filter_string = filters.join(", ");
    // Separate into cases based on which filters are used

    let region_list = ["na", "as", "eu"];
    let map_list = ["garden", "desert", "ocean", "jungle", "ant hell", "hel", "sewers"];

    let region_filter = false;
    let map_filter = false;
    for (const element of filters) {
      if (region_list.includes(element)) {
        region_filter = true;
      } else if (map_list.includes(element)) {
        map_filter = true;
      }
    }
    if (region_filter == map_filter) {
      // Either: both filters, or no filters. just dump the entire list
      let description_string = "";
      for (const [key, value] of Object.entries(servers)) {
        description_string += "\`\`\`js\ncp6.forceServerID(\"" + key + "\")\`\`\` ";
      }
      let embed = new EmbedBuilder()
        .setTitle(`Servers for: \`${filter_string.toUpperCase() || `all`}\``)
        .setDescription(description_string)

      await message.channel.send({
        embeds: [embed]
      });
    } else if (region_filter) {
      // Separate servers by map
      let description_string = "";
      for (const map of map_list) {
        description_string += "\n# " + map.toUpperCase() + "\n";
        for (const [key, value] of Object.entries(servers)) {
          if (formatArgs[value.map_id] == map) {
            description_string += "\`\`\`js\ncp6.forceServerID(\"" + key + "\")\`\`\` ";
          }
        }
      }
      let embed = new EmbedBuilder()
        .setTitle(`Servers for: \`${filter_string.toUpperCase()}\``)
        .setDescription(description_string)

      await message.channel.send({
        embeds: [embed]
      });
    } else if (map_filter) {
      // Separate servers by region
      let description_string = "";
      for (const region of region_list) {
        description_string += "\n# " + region.toUpperCase() + "\n";
        for (const [key, value] of Object.entries(servers)) {
          if (formatArgs[value.region] == region) {
            description_string += "\`\`\`js\ncp6.forceServerID(\"" + key + "\")\`\`\` ";
          }
        }
      }
      let embed = new EmbedBuilder()
        .setTitle(`Servers for: \`${filter_string.toUpperCase()}\``)
        .setDescription(description_string)

      await message.channel.send({
        embeds: [embed]
      });
    }
  }
};
