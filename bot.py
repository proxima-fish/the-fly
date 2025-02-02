# Your code here
import discord

import difflib
import time

import m28_api

intents = discord.Intents.default()
intents.message_content = True

client = discord.Client(intents=intents)

# Initial setup - read config files, etc
mob_stats = dict()
with open("stats.csv", "r") as f:
  lines = f.read().split("\n")
  for line in lines:
    linesplit = line.split(",")
    name = linesplit[0]
    count = int(linesplit[1])
    mob_time = int(linesplit[2])
    mob_stats[name] = {"count": count, "time": mob_time}

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
with open("abbreviations.csv", "r") as f:
  lines = f.read().split("\n")
  for line in lines:
    try:
      line_split = line.split(",")
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
  if len(params) == 0:
    return ""
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

def to_dhms(elapsed):
  days = elapsed // 86400
  elapsed -= days * 86400
  hours = elapsed // 3600
  elapsed -= hours * 3600
  minutes = elapsed // 60
  elapsed -= minutes * 60
  seconds = elapsed
  return f"{days}d {hours}h {minutes}m {seconds}s"

async def help(params, channel):
  await channel.send("Help command not implemented yet")

async def na(params, channel):
  await generic_super_message(to_mob(params), "NA", na_role)

async def eu(params, channel):
  await generic_super_message(to_mob(params), "EU", eu_role)

async def asia(params, channel):
  await generic_super_message(to_mob(params), "AS", as_role)

async def test(params, channel):
  await channel.send(f"Chosen match: {to_mob(params)}")

async def generic_super_message(mob, region, role_id):
  if mob == "":
    return
  # Update stats
  if mob not in mob_stats:
    mob_stats[mob] = {"count": 1, "time": int(time.time())}
  else:
    mob_stats[mob]["count"] += 1
    mob_stats[mob]["time"] = int(time.time())
  msg_embed = discord.Embed(title=mob, description=f"<@&{role_id}> A supper {mob} but spend in {region}", color=0x07a3eb)
  msg_embed.add_field(name="Lobby", value="Not implemented yet!", inline=False)
  channel = client.get_channel(int(ping_channel))
  await channel.send(embed=msg_embed)
  await channel.send(f"A supper {mob} but spend in {region} <@&{role_id}>", tts=True)

async def stats(params, channel):
  mob = to_mob(params)
  if mob == "":
    return
  count = 0
  mob_time = 0
  if mob in mob_stats:
    count = mob_stats[mob]["count"]
    mob_time = mob_stats[mob]["time"]
  elapsed = int(time.time()) - mob_time
  await channel.send(f"**{mob}**\nNumber of reports: {count}\nTime since last report: {to_dhms(elapsed)}")


# M28 api interface.
# Rate limited to avoid spamming the api
server_ids = dict()
last_query_time = 0

async def lobbies(params, channel):
  global last_query_time
  global server_ids
  # Update api if it's been more than 5 minutes since the last one
  if time.time() - last_query_time > 300:
    server_ids = m28_api.get_all_server_ids()
    last_query_time = time.time()
  param = params[0]
  if param in ["vultr-miami", "vultr_frankfurt", "vultr-tokyo"]:
    ids = server_ids[param]
    # ids = map of ID to list of server IDs
    response_str = ""
    for map_id, server_id_list in ids.items():
      response_str += f"**{m28_api.map_number_to_name[map_id]}**: {server_id_list}\n"
    await channel.send(response_str)
  elif param in m28_api.name_to_map_number:
    response_str = ""
    number = m28_api.name_to_map_number[param]
    for name, data in server_ids.items():
      response_str += f"**{name}**: {data[number]}\n"
    await channel.send(response_str)
  else:
    await channel.send("Unrecognized region or area name")

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
  "stats": stats,
  "s": stats,
  "l": lobbies,
  "lobbies": lobbies,
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
    if cmd in cmd_registry:
      try:
        await cmd_registry[cmd](params, message.channel)
      except Exception as e:
        await message.channel.send(f"Error during {cmd} execution: {str(e)}")
    else:
      # Do nothing
      pass

client.run(token)