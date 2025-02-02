import requests

# Returns a dict of region name : dict of map ID : list of server IDs

def get_all_server_ids():
  server_ids = dict()
  for i in range(7):
    a = get_server_ids_by_map(i)
    for name, ids in a.items():
      if name in server_ids:
          server_ids[name][i] = ids
      else:
          server_ids[name] = dict()
          server_ids[name][i] = ids
  return server_ids  

def get_server_ids_by_region(region):
  return get_all_server_ids()[region]

name_to_map_number = {
  "garden": 0,
  "desert": 1,
  "ocean": 2,
  "jungle": 3,
  "junglq": 3,
  "ant hell": 4,
  "and hell": 4,
  "any help": 4,
  "hel": 5,
  "sewers": 6,
  "seweroa": 6,
}

map_number_to_name = {
  0: "garden",
  1: "desert",
  2: "ocean",
  3: "jungle",
  4: "ant hell",
  5: "hel",
  6: "sewers",
}

# Wrapper for get_server_ids_by_map
def get_server_ids_by_map_name(name):
  return get_server_ids_by_map(name_to_map_number[name])

"""
Takes an integer map ID and returns a dict of region name : list of server IDs
0 = garden
1 = desert
2 = ocean
3 = jungle
4 = ant hell
5 = hel
6 = sewer
"""
def get_server_ids_by_map(map_number):
  response = requests.get(f"https://api.n.m28.io/endpoint/florrio-map-{map_number}-green/findEach/")
  servers = response.json()["servers"]
  region_to_ids = dict()
  for server, server_info in servers.items():
    if server not in region_to_ids:
      region_to_ids[server] = [server_info["id"]]
    else:
      region_to_ids[server].append(server_info["id"])
  return region_to_ids