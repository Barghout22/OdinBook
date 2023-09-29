const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.profile_display = asyncHandler(async (req, res, next) => {
  const currentUser = await User.findOne({ accountId: req.user.id });
  const requiredUser = await User.findById(req.params.userId);
  const own_profile =
    currentUser.accountId === requiredUser.accountId ? true : false;
  if (own_profile) {
    let allPosts = await Post.find({
      postingUser: currentUser,
    }).populate("postingUser");
    allPosts = await Promise.all(
      allPosts.map(async (post) => {
        let likeStatus = post.likes.includes(currentUser._id) ? true : false;
        let comment = await Comment.findOne({ post_reference: post }).populate(
          "commentorId"
        );
        return { ...post.toObject(), likeStatus, comment };
      })
    );

    res.render("profile", { user: currentUser, posts: allPosts, own_profile });
  } else {
    const friend_status = currentUser.friendRequests.include(requiredUser)
      ? "friends"
      : currentUser.friendRequests.include(requiredUser)
      ? currentUser.friendRequests.find(requiredUser).status
      : "not friends";

    if (friend_status !== "friends") {
      res.render("profile", {
        user: requiredUser,
        own_profile,
        friend_status,
      });
    } else {
      let allPosts = await Post.find({
        postingUser: requiredUser,
      }).populate("postingUser");
      allPosts = allPosts.map((post) => {
        let likeStatus = post.likes.includes(currentUser) ? true : false;
        post = { ...post.toObject(), likeStatus };
        return post;
      });

      res.render("profile", {
        user: currentUser,
        posts: allPosts,
        own_profile,
        friend_status,
      });
    }
  }
});

exports.get_about_form = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.userId);
  res.render("editAbout", { user: user });
});

exports.update_about_post = [
  body("user_about", "post body cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.userId);
    const errors = validationResult(req);
    const updatedUser = new User({
      accountId: user.accountId,
      name: user.name,
      profile_picture: user.profile_picture,
      about: req.body.user_about,
      friends: user.friends,
      friendRequests: user.friendRequests,
      _id: req.params.userId,
    });
    await User.findByIdAndUpdate(req.params.userId, updatedUser, {});
    res.redirect(user.url);
  }),
];
