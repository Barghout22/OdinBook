const passport = require("passport");
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/user");
require("dotenv").config();

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.CALLBACK_URL,
      profileFields: ["id", "displayName", "photos"],
    },
    async function (accessToken, refreshToken, profile, done) {
      console.log(profile.id);
      const user = await User.findOne({ acountId: profile.id });
      if (!user) {
        const user = new User({
          accountId: profile.id,
          name: profile.displayName,
          profile_picture: profile.photos[0].value,
        });
        await user.save();
        return done(null, profile);
      } else {
        return done(null, profile);
      }
    }
  )
);
