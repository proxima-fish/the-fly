# Your code here
import discord

import difflib

intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)

# Initial setup - read config files, etc
settings = dict()
with open("settings.txt", "r") as f:
  lines = f.read().split("\n")
  for line in lines:
    linesplit = line.split(" ")
    settings[linesplit[0]] = linesplit[1]

cmdstring = settings["cmd"]
na_role = settings["na_role"]
eu_role = settings["eu_role"]
as_role = settings["as_role"]
ping_channel = settings["ping_channel"]

moblist = []
with open("mob_list.txt", "r") as f:
  moblist = f.read().split("\n")

abbreviations = dict()
with open("abbreviations.txt", "r") as f:
  lines = f.read().split("\n")
  for line in lines:
    try:
      line_split = line.split(" ")
      abbreviations[line_split[0]] = line_split[1]
    except Exception:
      pass

token = ""
with open("token.txt", "r") as f:
  token = f.read().split("\n")[0]

# Utility functions
# Edit distance between two strings
def levenshteinDistance(s1, s2):
  if len(s1) > len(s2):
    s1, s2 = s2, s1

  distances = range(len(s1) + 1)
  for i2, c2 in enumerate(s2):
    distances_ = [i2+1]
    for i1, c1 in enumerate(s1):
      if c1 == c2:
        distances_.append(distances[i1])
      else:
        distances_.append(1 + min((distances[i1], distances[i1 + 1], distances_[-1])))
    distances = distances_
  return distances[-1]

# Try to fuzzy-string-match a set of words to a name
def to_mob(params):
  new_params = ""
  for i in params:
    new_params = new_params + i + " "
  new_params = new_params[:-1]
  mob_name = new_params.lower()
  # Try to find abbreviations
  if mob_name in abbreviations:
    mob_name = abbreviations[mob_name]
  # Try to find an exact match
  if mob_name in moblist:
    return mob_name
  # Try to find fuzzy close-matches
  min_name = moblist[0]
  min_dist = len(moblist[0])
  close_matches = difflib.get_close_matches(mob_name, moblist)
  if len(close_matches) != 0:
    moblist2 = close_matches
  else:
    moblist2 = moblist
  for mob_name2 in moblist2:
    dist = levenshteinDistance(mob_name, mob_name2)
    if dist < min_dist:
      min_dist = dist
      min_name = mob_name2
  # If nothing is found, return a default
  return min_name

async def help(params, channel):
  await channel.send("Help command not implemented yet")

async def na(params):
  await generic_super_message(to_mob(params), "NA", na_role)

async def eu(params):
  await generic_super_message(to_mob(params), "EU", eu_role)

async def asia(params):
  await generic_super_message(to_mob(params), "AS", as_role)

async def test(params, channel):
  await channel.send(f"Chosen match: {to_mob(params)}")

async def generic_super_message(mob, region, role_id):
  msg_embed = discord.Embed(title=mob, description=f"<@&{role_id}> A supper {mob} but has spend in {region}", color=0x07a3eb)
  msg_embed.add_field(name="Lobby", value="Not implemented yet!", inline=False)
  channel = client.get_channel(int(ping_channel))
  await channel.send(embed=msg_embed)
  await channel.send(f"<@&{role_id}> A supper {mob} but has spend in {region}")
  
cmd_registry = {
  "n": na,
  "na": na,
  "us": na,
  "u": na,
  "e": eu,
  "eu": eu,
  "a": asia,
  "as": asia,
  "asia": asia,
  "t": test,
  "test": test,
  "h": help,
  "help": help,
}

@client.event
async def on_ready():
    print(f'We have logged in as {client.user}')

@client.event
async def on_message(message):
    if message.author == client.user:
        return

    if message.content.startswith(cmdstring):
        content_array = message.content[1:].split(" ")
        if len(content_array) == 0:
            return
        cmd = content_array[0]
        params = content_array[1:]
        try:
            await cmd_registry[cmd](params, message.channel)
        except IndexError as e:
            await message.channel.send(f"Invalid / unimplemented command {cmd}")
        except Exception as e:
            await message.channel.send(f"Error during {cmd} execution")

client.run(token)