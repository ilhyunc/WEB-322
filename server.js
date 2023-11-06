/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: ___Ilhyun Cho_____ Student ID: __116342221____ Date: _10/13/23_____
*
********************************************************************************/

const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3000;
const legoData = require("./modules/legoSets");
app.use(express.static('public'));


legoData.initialize()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Error initializing Lego data:", error);
  });

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, '/views/home.html'));
});


app.get("/about", (req, res) => {
  res.sendFile(path.join(__dirname, '/views/about.html'));
});

app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;
  if (theme) {
    legoData.getSetsByTheme(theme)
      .then((sets) => {
        res.json(sets);
      })
      .catch((error) => {
        res.status(404).send("Error getting Lego sets");
      });
  } else {
    legoData.getAllSets()
      .then((sets) => {
        res.json(sets);
      })
      .catch((error) => {
        res.status(404).send("Error getting Lego sets");
      });
  }
});

app.get("/lego/sets/:setNum", (req, res) => {
  const setNum = req.params.setNum;
  legoData.getSetByNum(setNum)
    .then((set) => {
      if (set) {
        res.json(set);
      } else {
        res.status(404).send("Unable to find the requested set");
      }
    })
    .catch((error) => {
      res.status(404).send("Unable to find the requested set");
    });
});

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
});