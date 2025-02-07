const fs = require("node:fs");

module.exports = (client) => {
    let cmdFiles = fs.readdirSync(`./src/commands`).filter(file => file.endsWith("js"));

    for (let file of cmdFiles) {
        let command = require(`./commands/${file}`);
        if (command.name) client.commands.set(command.name, command);
        else continue;
    }
};