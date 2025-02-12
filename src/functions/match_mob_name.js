const { abbreviations } = require("../mob_files/abbreviations.json")
const { mobs } = require("../mob_files/mob_list.json")

// Helper function for edit distance.
// Takes two strings and returns the distance between them.
const levdist = (s, t) => {
  if (!s.length) return t.length;
  if (!t.length) return s.length;
  const arr = [];
  for (let i = 0; i <= t.length; i++) {
    arr[i] = [i];
    for (let j = 1; j <= s.length; j++) {
      arr[i][j] =
        i === 0
          ? j
          : Math.min(
              arr[i - 1][j] + 1,
              arr[i][j - 1] + 1,
              arr[i - 1][j - 1] + (s[j - 1] === t[i - 1] ? 0 : 1)
            );
    }
  }
  return arr[t.length][s.length];
};


exports.match_mob_name = function (mob) {
  if (abbreviations[mob]) {
    return abbreviations[mob];
  }
  let min_dist = 1000;
  let min_name = "";

  for (let i = 0; i < mobs.length; i++) {
    test_name = mobs[i].name;
    test_dist = levdist(mob, test_name);
    if (test_dist < min_dist) {
      min_dist = test_dist;
      min_name = test_name;
    }
  }
  if (min_dist > min_name.length / 2) return "";
  return min_name;
}