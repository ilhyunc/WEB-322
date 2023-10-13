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
  return new Promise((resolve) => {
    const matchingSets = sets.filter((set) =>
      set.theme.toLowerCase().includes(theme.toLowerCase())
    );
    resolve(matchingSets);
  });
}

module.exports = { initialize, getAllSets, getSetByNum, getSetsByTheme };
