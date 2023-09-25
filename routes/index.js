const express = require("express");
const router = express.Router();
const passport = require("passport");
require("./passport");

router.get("/", (req, res) => {
  if (req.user) {
    res.render("home");
  } else {
    res.redirect("/login");
  }
});
router.get("/login", (req, res) => {
  res.render("login");
});
router.get("/logout", (req, res) => {
  req.session = null;
  req.logout();
  res.redirect("/");
});

router.get("/auth/error", (req, res) => res.send("unknown error"));
router.get("/auth/facebook", passport.authenticate("facebook"));
router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect("/");
  }
);

module.exports = router;
