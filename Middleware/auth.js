const isLoggedIn = (req, res, next) => {
  if (req.user) {
    res.render("home");
  } else {
    res.render("login");
  }
};

module.exports = isLoggedIn;
