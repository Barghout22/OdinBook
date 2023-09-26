const Post = require("../models/post");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.homepage_display = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.redirect("/login");
  } else {
    const user = await User.findOne({ accountId: req.user.id });
    const allPosts = await Post.find({
      postingUser: user,
    }).populate("postingUser");
    for (let friend of user.friends) {
      const postsByFriend = await Post.find({ postingUser: friend }).populate(
        "postingUser"
      );
      allPosts = [...allPosts, ...postsByFriend];
    }
    res.render("home", { posts: allPosts });
  }
});
exports.post_creation = [
  body("post_body", "post body cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ accountId: req.user.id });
    const errors = validationResult(req);
    console.log(req.body);
    const newPost = new Post({
      postingUser: user,
      postBody: req.body.post_body,
      timeStamp: new Date(),
    });
    await newPost.save();
    res.redirect("/");
  }),
];
