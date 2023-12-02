const legoData = require("./modules/legoSets");
const express = require("express");
const authData = require("./modules/auth-service");
const clientSessions = require('client-sessions');

const path = require("path");
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static("public"));
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.use(
  clientSessions({
    cookieName: 'session', // this is the object name that will be added to 'req'
    secret: 'o6LjQ5EVNC28ZgK64hDELM18ScpFQr', // this should be a long un-guessable string.
    duration: 2 * 60 * 1000, // duration of the session in milliseconds (2 minutes)
    activeDuration: 1000 * 60, // the session will be extended by this many ms each request (1 minute)
  })
);

app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}


legoData.initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`server listening on: ${HTTP_PORT}`);
    });
  }).catch((err) => {
  console.log(`unable to start server: ${err}`);
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/lego/sets", async (req, res) => {
  try {
    const selectedFilter = req.query.theme || "All"; // Default to 'All' if no filter is provided
    console.log(selectedFilter);
    let sets;
    if (selectedFilter === "All") {
      sets = await legoData.getAllSets();
    } else {
      sets = await legoData.getSetsByTheme(selectedFilter);
    }
    

    if (sets.length === 0) {
      // No matching sets, display all sets
      const allSets = await legoData.getAllSets();
      res.render("sets", { sets: allSets, selectedFilter });
    } else {
      // Display sets filtered by the selected theme
      res.render("sets", { sets, selectedFilter });
    }
  } catch (error) {
    res
      .status(404)
      .render("404", { message: "No Sets found for a matching theme" });
  }
});

app.get("/lego/addSet", ensureLogin, async(req, res) => {
  try {
    const themes = await legoData.getAllThemes();
    res.render("addSet", { themes: themes });
  } catch {
    res.render("500", { message: "Failed to query theme data from Database" });
  }
});

app.post("/lego/addSet", ensureLogin, async(req, res) => {
  try {
    await legoData.addSet(req.body);
    res.redirect("/lego/sets");
  } catch(err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/editSet/:num", ensureLogin, async(req, res) => {
  try {
    const getSet = await legoData.getSetByNum(req.params.num);
    const getThemes = await legoData.getAllThemes();
    res.render("editSet", { themes: getThemes, set: getSet });
  } catch (error) {
    res.status(404).render("404", { message: error });
  }
});

app.post("/lego/editSet", ensureLogin, async(req, res) => {
  try {
    await legoData.editSet(req.body.set_num, req.body);
    res.redirect("/lego/sets");
  } catch(err) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${err}` });
  }
});

app.get("/lego/deleteSet/:num", ensureLogin, async(req, res) => {
  try {
    await legoData.deleteSet(req.params.num);
    res.redirect("/lego/sets");
  } catch (error) {
    res.render("500", { message: `I'm sorry, but we have encountered the following error: ${error}` });
  }
});

async function fetchRandomQuote() {
  try {
    const response = await fetch("https://quotable.io/random");
    if (!response.ok) {
      throw new Error(
        `Failed to fetch a random quote (HTTP ${response.status})`
      );
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch a random quote:", error);
    return null; // Handle the error by returning null or some default value
  }
}

app.get("/lego/sets/:setID", async (req, res) => {
  try {
    const set = await legoData.getSetByNum(req.params.setID);
    // Fetch a random quote using an AJAX request
    //const fetch = require('node-fetch'); // Node.js fetch library
    const quoteData = await fetchRandomQuote();

    res.render("set", { set: set, quote: quoteData });
  } catch (error) {
    res
      .status(404)
      .render("404", { message: "No Sets found for a matching ID" });
  }
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/login", (req, res) => {
  res.render("login", {errorMessage: null});
});

app.get("/register", (req, res) => {
  res.render("register", {successMessage: null, errorMessage: null});
});

app.post("/register", (req, res) => {
  try {
    authData.registerUser(req.body);
    res.render("register", {successMessage: "User created", errorMessage: null});
  } catch (error) {
    res.render("register", {errorMessage: error, userName: req.body.userName, });
  }
});

app.post("/login", (req, res) => {
  
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body)
    .then((user) => {
      req.session.user = {
        userName: user.userName,
        email: user.email,
        loginHistory: user.loginHistory
      }
      res.redirect("/lego/sets");
    })
    .catch((error) =>{
    res.render("login", {errorMessage: error, userName: req.body.userName});
  });
});

app.get("/logout", (req, res) => {
  req.session.reset();
  res.redirect("/");
});

app.get("/userHistory", ensureLogin, (req, res) => {
  res.render("userHistory");
});

app.get("/404", (req, res) => {
  res.render("404");
});

app.use((req, res, next) => {
  res
    .status(404)
    .render("404", {
      message: "We're unable to find what you're looking for.",
    });
});