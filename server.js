/********************************************************************************
*  WEB322 – Assignment 05
* 
*  I declare that this assignment is my own work in accordance with Seneca's
*  Academic Integrity Policy:
* 
*  https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: ___Ilhyun Cho_____ Student ID: __116342221____ Date: _27/11/23_____
*
*  Published URL: _____https://breakable-bear-khakis.cyclic.app/___________
*
********************************************************************************/

const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 8080;
const legoSets = require("./modules/legoSets");

// const themeData = require('./data/themeData');
// const setData = require('./data/setData');


app.set('view engine', 'ejs');
app.use(express.static('public'));
// app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));

legoSets.initialize()
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
    legoSets.getSetsByTheme(theme)
      .then((sets) => {
        //res.json(sets);
        res.render("sets", { sets: sets});
      })
      .catch((error) => {
        //res.status(404).send("Error getting Lego sets");
        res.status(404).render("404", { message: "Error getting Lego sets" });
      });
  } else {
    legoSets.getAllSets()
      .then((sets) => {
        //res.json(sets);
        res.render("sets", { sets: sets });
      })
      .catch((error) => {
        //res.status(404).send("Error getting Lego sets");
        res.status(404).render("404", { message: "Error getting Lego sets" });
      });
  }
});

app.get("/lego/sets/:setNum", (req, res) => {
  const setNum = req.params.setNum;
  legoSets.getSetByNum(setNum)
    .then((set) => {
      if (set) {
        // Change this line to pass the correct variable name 'set'
        res.render("set", { set: set });
      } else {
        res.status(404).render("404", {message:"Lego set not found for set number: " + setNum});
      }
    })
    .catch((error) => {
      res.status(404).render("404", { message: error});
    });
});







//////////////////////////////////////////////////////////////////////////////
app.get('/lego/addSet', (req, res) => {
  legoSets.getAllThemes()
    .then((themes) => {
      res.render('addSet', { themes: themes });
    })
    .catch((error) => {
      res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
    });
});


// Route for handling addition of a new set
app.post('/lego/addSet', async (req, res) => {
  try {
    const setData = req.body;
    await legoSets.addSet(setData);
    res.redirect('/lego/sets');
  } catch (error) {
    res.render('500', { message: `Error: ${error.message}` });
  }
});

// Route for editing an existing set
app.get('/lego/editSet/:num', async (req, res) => {
  try {
    const setNum = req.params.num;
    const set = await legoSets.getSetByNum(setNum);
    const themes = await legoSets.getAllThemes();
    res.render('editSet', { setNum, set, themes });//////////////
  } catch (error) {
    res.render('404', { message: `Error: ${error.message}` });
  }
});

// Route for handling the edited set
app.post('/lego/editSet', async (req, res) => {
  try {
    const { setNum, setName, setYear, numParts, themeSelect } = req.body;
    const setData = {
      name: setName,
      year: setYear,
      num_parts: numParts,
      theme_id: themeSelect,
    };

    await legoSets.editSet(setNum, setData);
    res.redirect('/lego/sets');
  } catch (error) {
    res.render('500', { message: `Error: ${error.message}` });
  }
});

app.get('/lego/deleteSet/:num', async (req, res) => {
  try {
    const setNum = req.params.num;
    await legoSets.deleteSet(setNum);
    res.redirect('/lego/sets'); // Redirect to sets route after deleting the set
  } catch (error) {
    res.render('500', { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
});