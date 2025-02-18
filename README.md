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

(Coming soon) Configuration commands through discord

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
    "trader_role": "1339143893253488722",
    "max_fakes": 3
}
```

`ping_channel` is the ID of the channel where the bot sends pings.

`na_role`, `eu_role` and `as_role` are the IDs of their respective ping roles. They can be the same if you want to just have one global ping notify role. `trader_role` is the role to ping for trader notifications.

`token` is your bot's token that you saved earlier. Paste that in place of `YOUR_TOKEN_HERE`. Don't let anyone see it!

`prefix` is the bot's command prefix. You can set it to whatever you want. I like using `,` because it doesn't conflict with other similar bots.

# User Manual

A list of the bot's commands and how to use them.

## Super Reporting

This is the heart of the bot. To report a super mob spawn, type in any channel visible to the bot:

`,[region] [name|abbreviation]` (or whatever prefix has been configured).

The bot listens on all servers that it's joined and sends pings to one channel specified in its config file.

`region` is the region in which the bot spawned (`na, eu, as`). Some shorter abbreviations work too, like `n, e, a`. The bot will try to match the name to the name of an existing mob, or one of the common abbreviations listed in `src/mob_files/abbreviations.json`.

If the input is too far off from any mob name, the bot won't send a message and will react with X to the report. Same if it's a duplicate report, or (coming soon) a likely fake.

If the report is valid, the bot will react with checkmark and ping the appropriate role. The message will also include server join commands, a place for the reporter to add notes (e.g. which map it's in, or where in the map), and an option for other users to mark as fake.

If 3 or more people mark the report as fake (this number is configurable), then the bot will edit the message to make that clear. IF the original reporter marks it as fake, the bot will immediately mark the message as fake without waiting for more people.

## Trader Reporting

To report the trader's location:

`,trader [region]`

where `region` can be one of `na, eu, as`.

The bot will display a grid overlaying a map of Desert. At this point you have 30 seconds to type a coordinate, or cancel the operation by typing `cancel`. For example if the trader is in the sandstorm zone you would say `a1` or `b1`.

The pings are structured very similarly to Super pings, deliberately.

## Testing Autocorrect

To test the bot's string matching for super reports:

`,test [name]`

The bot will return what it thinks is the closest match to the input. If it doesn't give any match that means that the input didn't match any known name or abbreviation.

## Lobby listing

To view a list of all florr servers known to the bot, matching some set of filters:

`,lobbies [filter]`

A filter consists of 0-2 search terms. If there are no filters provided, the bot displays a list of every server.

One type of filtering is by region. You can filter either by shorthand (`na, eu, as` etc) or by server region name (`vultr-miami` etc).

Another type of filtering is by map. You can filter by name (`garden`, `desert`, etc) or by map ID (a number 0 through 6).

You can filter by either of these alone, or both.

The bot will let you know if you specified an invalid filter.

## Ping testing

`,ping`

Displays the bot's one-way and round-trip pings.

## Help

For a list of commands:

`,help`

For more details about a specific command:

`,help [name]`