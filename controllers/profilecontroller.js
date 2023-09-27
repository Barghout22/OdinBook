const Post = require("../models/post");
const User = require("../models/user");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.profile_display = asyncHandler(async (req, res, next) => {
  const currentUser = await User.findOne({ accountId: req.user.id });
  console.log(req.params);
  const requiredUser = await User.findById(req.params.userId);
  const own_profile =
    currentUser.accountId === requiredUser.accountId ? true : false;
  if (own_profile) {
    let allPosts = await Post.find({
      postingUser: currentUser,
    }).populate("postingUser");
    allPosts = allPosts.map((post) => {
      let likeStatus = post.likes.includes(currentUser) ? true : false;
      post = { ...post.toObject(), likeStatus };
      return post;
    });

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
