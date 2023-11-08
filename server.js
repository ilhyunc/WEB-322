/********************************************************************************
* WEB322 – Assignment 4
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: ___Ilhyun Cho_____ Student ID: __116342221____ Date: _11/06/23_____
*
<<<<<<< HEAD
*  Published URL: ______https://fair-teal-salmon-boot.cyclic.app/___________
=======
*  Published URL: _____https://fine-jade-hermit-crab-sock.cyclic.app___________
>>>>>>> 2cf4981 (2023-11-08)
*
********************************************************************************/

const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 8080;
const legoData = require("./modules/legoSets");

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));


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
  //res.sendFile(path.join(__dirname, '/views/home.html'));
  res.render("home");
});

app.get("/about", (req, res) => {
  //res.sendFile(path.join(__dirname, '/views/about.html'));
  res.render("about");
});


app.get("/lego/sets", (req, res) => {
  const theme = req.query.theme;
  if (theme) {
    legoData.getSetsByTheme(theme)
      .then((sets) => {
        //res.json(sets);
        res.render("sets", { sets, page: '/lego/sets', theme: theme });
      })
      .catch((error) => {
        //res.status(404).send("Error getting Lego sets");
        res.status(404).render("404", { message: "Error getting Lego sets" });
      });
  } else {
    legoData.getAllSets()
      .then((sets) => {
        //res.json(sets);
        res.render("sets", { sets, page: '/lego/sets', theme: '' });
      })
      .catch((error) => {
        //res.status(404).send("Error getting Lego sets");
        res.status(404).render("404", { message: "Error getting Lego sets" });
      });
  }
});

app.get("/lego/sets/:setNum", (req, res) => {
  const setNum = req.params.setNum;
  legoData.getSetByNum(setNum)
    .then((set) => {
      if (set) {
        // Change this line to pass the correct variable name 'set'
        res.render("set", { set: set });
      } else {
        res.status(404).send("Lego set not found for set number: " + setNum);
      }
    })
    .catch((error) => {
      res.status(404).send("Error: " + error);
    });
});

app.use((req, res) => {
  res.status(404).render('404', { message: 'Error 404 - Page Not Found' });
});