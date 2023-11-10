const setData = require("../data/setData");
const themeData = require("../data/themeData");

let sets = [];

function initialize() {
  return new Promise((resolve) => {
    sets = setData.map((set) => ({
      ...set,
      theme: themeData.find((theme) => theme.id === set.theme_id).name,
    }));
    resolve();
  });
}

function getAllSets() {
  return new Promise((resolve) => {
    resolve(sets);
  });
}

function getSetByNum(setNum) {
  return new Promise((resolve, reject) => {
    const foundSet = sets.find((set) => set.set_num === setNum);
    if (foundSet) {
      resolve(foundSet);
    } else {
      reject("Unable to find requested set");
    }
  });
}

function getSetsByTheme(theme) {
  const filteredSets = sets.filter((set) => set.theme.toLowerCase().includes(theme.toLowerCase()));
  if (filteredSets.length > 0) {
      return Promise.resolve(filteredSets);
  } else {
      return Promise.reject("Unable to find requested sets.");
  }
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };
