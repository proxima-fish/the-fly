const { abbreviations } = require("../mob_files/abbreviations.json")

exports.match_mob_name = function (mob) {
  if (abbreviations[mob]) {
    mob = abbreviations[mob];
  }

  // TODO: Even if there's no abbreviation, fuzzy match with closest name
  // this should be the easy part... right?
 
  return mob;
}