var https = require('https');
const { ping_channel } = require("../config.json");

// List of all servers known to the scraper.
// Map of server ID to object containing region, map ID, and last timestamp.
let server_list = {};

const server_timeout_time = 5 * 60 * 1000; // 5 minutes as milliseconds

let last_hash = "";

function query_server (server_id) {
  let url = "https://" + server_id + ".s.m28n.net";
  https.get(url, (res) => {
    const { statusCode } = res;
    if (statusCode !== 200) {
      console.log("API request failed");
      res.resume();
      return;
    }
    res.setEncoding('utf8');
    let response_data = '';
    res.on('data', (chunk) => { response_data += chunk; });
    res.on('end', () => {
      let parsedData = JSON.parse(response_data);
      let hash = parsedData.webHash;
      if (hash != last_hash) {
        if (last_hash != "") {        
           console.log("Likely new build");
        }
        last_hash = hash;
      }
      server_list[server_id].hash = hash;
    });
  });
}

function query_single_map (map_id) {
  let url = "https://api.n.m28.io/endpoint/florrio-map-" + map_id + "-green/findEach/";
  https.get(url, (res) => {
    const { statusCode } = res;
    if (statusCode !== 200) {
      console.log("API request failed");
      res.resume();
      return;
    }
    res.setEncoding('utf8');
    let response_data = '';
    res.on('data', (chunk) => { response_data += chunk; });
    res.on('end', () => {
      let parsedData = JSON.parse(response_data);
      let servers = parsedData.servers;
      for (const [key, value] of Object.entries(servers)) {
        // key = server name (miami, frankfurt, tokyo); value.id = server ID
        let timestamp = Date.now();
        if (value.id in server_list) {
          // Update timestamp
          server_list[value.id].timestamp = Date.now();
        } else {
          // Emplace
          console.log("New server: " + value.id);
          server_list[value.id] = {
            "region": key,
            "map_id": map_id.toString(),
            "timestamp": Date.now()
          };
          query_server(value.id);
        }
      }
    });
  });
}

// Filter = array of strings
exports.get_servers = function (filter) {
  let filtered_list = {}
  if (filter == "") {
    return server_list;
  }
  // Preprocess filters
  for (var i = 0; i < filter.length; i++) {
    let name_to_server = {
      "na": "vultr-miami",
      "n":  "vultr-miami",
      "u":  "vultr-miami",
      "us": "vultr-miami",
      "a":  "vultr-tokyo",
      "as": "vultr-tokyo",
      "e":  "vultr-frankfurt",
      "eu": "vultr-frankfurt"
    }
    let name_to_map = {
      "garden":   '0',
      "desert":   '1',
      "ocean":    '2',
      "jungle":   '3',
      "ant":      '4',
      "hel":      '5',
      "sewers":   '6',
      "factory":  '7'
    }
    let filter_string = filter[i].toLowerCase();
    if (filter_string == "ant hell") {
      filter_string = "ant";
    }
    if (filter_string in name_to_server) {
      filter_string = name_to_server[filter_string];
    }
    if (filter_string in name_to_map) {
      filter_string = name_to_map[filter_string];
    }
    
    filter[i] = filter_string;
    // Another special case for ant hell
    if (filter_string == "hell") {
      filter.splice(i, 1);
      i -= 1;
    }
  }
  for (var [key, value] of Object.entries(server_list)) {
    let overall_match = true;
    // Include item if all filter entries match any data item
    for (var i = 0; i < filter.length; i++) {
      let filter_string = filter[i];
      let match = false;
      for (var [key2, value2] of Object.entries(value)) {
        if (value2 == filter_string) {
          match = true;
          break;
        }
      }
      if (!match) {
        overall_match = false;
        break;
      }
    }
    if (overall_match) {
      filtered_list[key] = value;
    }
  }
  return filtered_list;
}

exports.start_scrape = function() {
  scrape();
  setInterval(() => {
    scrape();
  }, 3000);
}

function scrape () {
  // Scrape servers
  for (let i = 0; i < 8; i++) {
    query_single_map(i);
  }
  // Remove anything that is old (hasn't been served in the past some number of minutes)
  for (var [key, value] of Object.entries(server_list)) {
    time_interval = Date.now() - value.timestamp;
    hash = value.hash;
    if (time_interval > server_timeout_time || hash != last_hash) {
      console.log("Deleted server " + key);
      delete server_list[key];
    }
  }
}

