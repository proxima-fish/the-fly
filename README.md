# The Fly

The Fly is a Discord bot created by [bug] for super pings and other miscellaneous florr related activities.

Currently in very early development. Some features may not work as intended.

For a user manual, go [here](#user-manual).
For a startup guide, go [here](#startup-guide).

# Startup Guide

## Get a Discord bot account

Go to [Discord Developer Portal](https://discord.com/developers/applications) and select "New Application".

Choose a name, agree to the terms of service, and create the application. If necessary you can choose an icon, set a description, etc.

Go to the "Installation" tab on the left of the screen and look at the "Default install settings" section. Under "Guild Install" there should be a "Scopes" drop-down menu. Add "bot" to the scopes.

Go up to the "Install Link" section and copy the link. Opening the link gives you a dialog in Discord where you can add the bot to a server where you have permissions.

Go to the "Bot" tab on the left and reset the bot's token. Make sure to copy it and save it somewhere safe, since you can't view it again unless you reset it.

In the "Privileged Gateway Intents" section, allow all three privileged intents. Make sure to save your changes.

You now have a bot account! But now you need to do something with it.

## Install the bot software

The recommended solution is to use a third party hosting provider. I use [PebbleHost](https://pebblehost.com/bot-hosting) but others exist. The hosting provider will provide instructions on how to set up the bot. After installation, go to [Configure the bot](#configure-the-bot).

If you want to host the bot on your own machine, you'll need Node.js. Instructions to download Node.js are [here](https://nodejs.org/en/download).

### Mac Instructions

While the bot should work on a Mac, none of us develop on one. Ping one of us on discord (proxima_fish, j5ylim, _vap) if you have ideas for a guide!

### Linux Instructions

These instructions were tested on Ubuntu 20.04.6.

After you've installed Node.js, open a terminal and clone the fly's repository:

`git clone https://github.com/proxima-fish/the-fly.git`

Or if you want to clone with SSH:

`git clone git@github.com:proxima-fish/the-fly.git`

Now that you've cloned the repo, go to [Configure the bot](#configure-the-bot).

Once you're done with configuration, go to the fly's parent directory:

`cd the-fly`

And run the bot:

`node src/bot.js`

### Windows Instructions

TODO: @vap please fill in

## Configure the bot

This section will be changed later.

For now, the configuration instructions are as follows:

Go into the fly's src/ directory and create a new `config.json` file. The contents should look something like this:
```
{
    "prefix": ",",
    "token": "YOUR_TOKEN_HERE",
    "ping_channel": "1124665317675778081",
    "na_role": "1337265848154460191",
    "eu_role": "1337265970577936437",
    "as_role": "1337265996234358834",
    "max_fakes": 3
}
```

`ping_channel` is the ID of the channel where the bot sends pings.
`na_role`, `eu_role` and `as_role` are the IDs of their respective ping roles. They can be the same if you want to just have one global ping notify role.
`token` is your bot's token that you saved earlier. Paste that in place of `YOUR_TOKEN_HERE`. Don't let anyone see it!
`prefix` is the bot's command prefix. You can set it to whatever you want. I like using `,` because it doesn't conflict with other similar bots.
