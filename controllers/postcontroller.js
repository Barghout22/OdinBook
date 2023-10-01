const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment");
const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

exports.homepage_display = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    res.redirect("/login");
  } else {
    const user = await User.findOne({ accountId: req.user.id });
    let allPosts = await Post.find({
      postingUser: user,
    }).populate("postingUser");
    for (let friend of user.friends) {
      const postsByFriend = await Post.find({ postingUser: friend }).populate(
        "postingUser"
      );
      allPosts = [...allPosts, ...postsByFriend];
    }
    allPosts = await Promise.all(
      allPosts.map(async (post) => {
        let likeStatus = post.likes.includes(user._id) ? true : false;
        let comment = await Comment.findOne({ post_reference: post }).populate(
          "commentorId"
        );
        return { ...post.toObject(), likeStatus, comment };
      })
    );
    allPosts = allPosts.sort(function (a, b) {
      return new Date(b.timeStamp) - new Date(a.timeStamp);
    });
    res.render("home", { currentUser: user, posts: allPosts });
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
    // console.log(req.body);
    const newPost = new Post({
      postingUser: user,
      postBody: req.body.post_body,
      timeStamp: new Date(),
    });
    await newPost.save();
    res.redirect("/");
  }),
];

exports.post_details = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ accountId: req.user.id });
  const post = await Post.findById(req.params.postId).populate("postingUser");
  let comments = await Comment.find({
    post_reference: req.params.postId,
  }).populate("commentorId");
  if (comments) {
    comments = comments.map((comment) => {
      let commentLikeStatus = comment.likes_count.includes(user._id)
        ? true
        : false;
      return { ...comment.toObject(), commentLikeStatus };
    });
  }

  const likeStatus = post.likes.includes(user._id) ? true : false;
  res.render("post", {
    currentUser: user,
    post: post,
    comments: comments,
    likeStatus,
  });
});

exports.comment_addition = [
  body("comment_body", "post body cannot be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ accountId: req.user.id });
    const post = await Post.findById(req.params.postId).populate("postingUser");
    const errors = validationResult(req);
    const comment = new Comment({
      commentorId: user,
      comment_content: req.body.comment_body,
      post_reference: post,
      comment_date: new Date(),
    });
    await comment.save();
    const comments = await Comment.find({ post_reference: post._id }).populate(
      "commentorId"
    );
    // console.log(comments);
    const likeStatus = post.likes.includes(user._id) ? true : false;
    res.redirect(post.url);
  }),
];
exports.toggle_post_likes = asyncHandler(async (req, res, next) => {
  const post = await Post.findById(req.params.postId);
  const user = await User.findOne({ accountId: req.user.id });
  let likes = post.likes;
  const index = likes.indexOf(user._id);
  if (index > -1) {
    likes.splice(index, 1);
  } else {
    likes.push(user);
  }
  const updatedPost = new Post({
    postingUser: post.postingUser,
    postBody: post.postBody,
    timeStamp: post.timeStamp,
    likes: likes,
    _id: req.params.postId,
  });
  await Post.findByIdAndUpdate(req.params.postId, updatedPost, {});
  res.redirect("back");
});

exports.toggle_comment_likes = asyncHandler(async (req, res, next) => {
  console.log(req.params.commentId);
  const comment = await Comment.findById(req.params.commentId);
  console.log(comment);
  const user = await User.findOne({ accountId: req.user.id });
  let likes = comment.likes_count;
  const index = likes.indexOf(user._id);
  if (index > -1) {
    likes.splice(index, 1);
  } else {
    likes.push(user);
  }
  const updatedComment = new Comment({
    commentorId: user,
    comment_content: comment.comment_content,
    post_reference: comment.post_reference,
    likes_count: likes,
    comment_date: comment.comment_date,
    _id: req.params.commentId,
  });
  await Comment.findByIdAndUpdate(req.params.commentId, updatedComment, {});
  res.redirect("back");
});
