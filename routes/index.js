const express = require("express");
const router = express.Router();
const passport = require("passport");
const post_controller = require("../controllers/postcontroller");
const profile_controller = require("../controllers/profilecontroller");
require("../Middleware/passport");

router.get("/", post_controller.homepage_display);
router.post("/posts", post_controller.post_creation);
router.get("/posts/:postId", post_controller.post_details);
router.post("/posts/:postId", post_controller.comment_addition);
router.get("/users/:userId", profile_controller.profile_display);
router.get("/posts/:postId/likes", post_controller.toggle_likes);

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
