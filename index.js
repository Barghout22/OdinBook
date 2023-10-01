const express = require("express");
const path = require("path");

const app = express();
const cookieSession = require("cookie-session");
const passport = require("passport");
const mongoose = require("mongoose");
const loggedIn = require("./Middleware/auth.js");
const port = process.env.PORT || 3000;
require("dotenv").config();
const indexRouter = require("./routes/index");

const mongoDb = process.env.MONGODB_URI;
mongoose.connect(mongoDb, { useUnifiedTopology: true, useNewUrlParser: true });
const db = mongoose.connection;
db.on("error", console.error.bind(console, "mongo connection error"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  cookieSession({ name: "facebook-auth-session", keys: ["key1", "key2"] })
);
app.use(express.urlencoded({ extended: false }));

app.use(passport.initialize());
app.use(passport.session());
// app.use("/", loggedIn);

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use("/", indexRouter);
app.use(express.static(__dirname + "/public"));

app.listen(port, () => {
  console.log("server is up and running on port", port);
});
