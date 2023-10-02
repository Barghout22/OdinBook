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
    allPosts = allPosts.sort(function (a, b) {
      return new Date(b.timeStamp) - new Date(a.timeStamp);
    });
    res.render("profile", { user: currentUser, posts: allPosts, own_profile });
  } else {
    let index = currentUser.friendRequests.findIndex(
      (acc) => acc.requestUser._id.toString() === requiredUser._id.toString()
    );

    const friend_status = currentUser.friends.includes(requiredUser._id)
      ? "friends"
      : index > -1
      ? currentUser.friendRequests[index].status
      : "not friends";
    if (friend_status !== "friends") {
      res.render("profile", {
        currentUser: currentUser,
        user: requiredUser,
        own_profile,
        friend_status,
        posts: false,
      });
    } else {
      let allPosts = await Post.find({
        postingUser: requiredUser,
      }).populate("postingUser");
      allPosts = allPosts.map((post) => {
        let likeStatus = post.likes.includes(currentUser._id) ? true : false;
        post = { ...post.toObject(), likeStatus };
        return post;
      });
      allPosts = allPosts.sort(function (a, b) {
        return new Date(b.timeStamp) - new Date(a.timeStamp);
      });
      res.render("profile", {
        currentUser: currentUser,
        user: requiredUser,
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

exports.display_other_users = asyncHandler(async (req, res, next) => {
  const currentUser = await User.findOne({ accountId: req.user.id });
  let allUsers = await User.find();
  const findUser = (user) => user.accountId === currentUser.accountId;
  const index = allUsers.findIndex(findUser);
  allUsers.splice(index, 1);
  allUsers = allUsers.map((user) => {
    let index = currentUser.friends.findIndex(
      (acc) => acc._id.toString() === user._id.toString()
    );
    let friend_status;
    if (index > -1) {
      friend_status = "friends";
    } else {
      index = currentUser.friendRequests.findIndex(
        (acc) => acc.requestUser._id.toString() === user._id.toString()
      );
      if (index > -1) {
        friend_status = currentUser.friendRequests[index].status;
      } else friend_status = "not friends";
    }

    return { ...user.toObject(), friend_status };
  });
  res.render("displayUsers", { users: allUsers, currentUser: currentUser });
});
exports.add_friend = asyncHandler(async (req, res, next) => {
  const currentUser = await User.findOne({ accountId: req.user.id });
  const requiredUser = await User.findById(req.params.userId);
  let currentUserRequestList = currentUser.friendRequests;
  let requiredUseRequestList = requiredUser.friendRequests;
  currentUserRequestList.push({
    requestUser: requiredUser,
    status: "sent request",
  });
  requiredUseRequestList.push({
    requestUser: currentUser,
    status: "received request",
  });
  const updatedCurrentUser = new User({
    accountId: currentUser.accountId,
    name: currentUser.name,
    profile_picture: currentUser.profile_picture,
    about: currentUser.about,
    friends: currentUser.friends,
    friendRequests: currentUserRequestList,
    _id: currentUser._id,
  });
  const updatedRequiredUser = new User({
    accountId: requiredUser.accountId,
    name: requiredUser.name,
    profile_picture: requiredUser.profile_picture,
    about: requiredUser.about,
    friends: requiredUser.friends,
    friendRequests: requiredUseRequestList,
    _id: requiredUser._id,
  });
  await Promise.all([
    User.findByIdAndUpdate(currentUser._id, updatedCurrentUser, {}),
    User.findByIdAndUpdate(requiredUser._id, updatedRequiredUser, {}),
  ]);
  res.redirect("back");
});

exports.cancel_friend_request = asyncHandler(async (req, res, next) => {
  const currentUser = await User.findOne({ accountId: req.user.id });
  const requiredUser = await User.findById(req.params.userId);
  let currentUserRequestList = currentUser.friendRequests;
  let requiredUserRequestList = requiredUser.friendRequests;
  let indexInCurrentUser = currentUserRequestList.findIndex(
    (User) => User.requestUser.accountId === requiredUser.accountId
  );
  let indexInRequiredUser = requiredUserRequestList.findIndex(
    (User) => User.requestUser.accountId === currentUser.accountId
  );
  currentUserRequestList.splice(indexInCurrentUser, 1);
  requiredUserRequestList.splice(indexInRequiredUser, 1);
  const updatedCurrentUser = new User({
    accountId: currentUser.accountId,
    name: currentUser.name,
    profile_picture: currentUser.profile_picture,
    about: currentUser.about,
    friends: currentUser.friends,
    friendRequests: currentUserRequestList,
    _id: currentUser._id,
  });
  const updatedRequiredUser = new User({
    accountId: requiredUser.accountId,
    name: requiredUser.name,
    profile_picture: requiredUser.profile_picture,
    about: requiredUser.about,
    friends: requiredUser.friends,
    friendRequests: requiredUserRequestList,
    _id: requiredUser._id,
  });
  await Promise.all([
    User.findByIdAndUpdate(currentUser._id, updatedCurrentUser, {}),
    User.findByIdAndUpdate(requiredUser._id, updatedRequiredUser, {}),
  ]);
  res.redirect("back");
});

exports.accept_friend_request = asyncHandler(async (req, res, next) => {
  const currentUser = await User.findOne({ accountId: req.user.id });
  const requiredUser = await User.findById(req.params.userId);
  let currentUserRequestList = currentUser.friendRequests;
  let requiredUserRequestList = requiredUser.friendRequests;
  let currentUserFriendList = currentUser.friends;
  let requiredUserFriendList = requiredUser.friends;
  currentUserFriendList.push(requiredUser);
  requiredUserFriendList.push(currentUser);
  let indexInCurrentUser = currentUserRequestList.findIndex(
    (User) => User.requestUser.accountId === requiredUser.accountId
  );
  let indexInRequiredUser = requiredUserRequestList.findIndex(
    (User) => User.requestUser.accountId === currentUser.accountId
  );
  currentUserRequestList.splice(indexInCurrentUser, 1);
  requiredUserRequestList.splice(indexInRequiredUser, 1);
  const updatedCurrentUser = new User({
    accountId: currentUser.accountId,
    name: currentUser.name,
    profile_picture: currentUser.profile_picture,
    about: currentUser.about,
    friends: currentUserFriendList,
    friendRequests: currentUserRequestList,
    _id: currentUser._id,
  });
  const updatedRequiredUser = new User({
    accountId: requiredUser.accountId,
    name: requiredUser.name,
    profile_picture: requiredUser.profile_picture,
    about: requiredUser.about,
    friends: requiredUserFriendList,
    friendRequests: requiredUserRequestList,
    _id: requiredUser._id,
  });
  await Promise.all([
    User.findByIdAndUpdate(currentUser._id, updatedCurrentUser, {}),
    User.findByIdAndUpdate(requiredUser._id, updatedRequiredUser, {}),
  ]);
  res.redirect("back");
});

exports.remvoe_friend = asyncHandler(async (req, res, next) => {
  const currentUser = await User.findOne({ accountId: req.user.id });
  const requiredUser = await User.findById(req.params.userId);
  let currentUserFriendList = currentUser.friends;
  let requiredUserFriendList = requiredUser.friends;

  let indexInCurrentUser = currentUserFriendList.findIndex(
    (User) => User._id.toString() === requiredUser._id.toString()
  );
  let indexInRequiredUser = requiredUserFriendList.findIndex(
    (User) => User._id.toString() === currentUser._id.toString()
  );
  currentUserFriendList.splice(indexInCurrentUser, 1);
  requiredUserFriendList.splice(indexInRequiredUser, 1);
  const updatedCurrentUser = new User({
    accountId: currentUser.accountId,
    name: currentUser.name,
    profile_picture: currentUser.profile_picture,
    about: currentUser.about,
    friends: currentUserFriendList,
    friendRequests: currentUser.friendRequests,
    _id: currentUser._id,
  });
  const updatedRequiredUser = new User({
    accountId: requiredUser.accountId,
    name: requiredUser.name,
    profile_picture: requiredUser.profile_picture,
    about: requiredUser.about,
    friends: requiredUserFriendList,
    friendRequests: requiredUser.friendRequests,
    _id: requiredUser._id,
  });
  await Promise.all([
    User.findByIdAndUpdate(currentUser._id, updatedCurrentUser, {}),
    User.findByIdAndUpdate(requiredUser._id, updatedRequiredUser, {}),
  ]);
  res.redirect("back");
});
