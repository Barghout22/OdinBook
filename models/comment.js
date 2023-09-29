const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  commentorId: { type: Schema.Types.ObjectId, ref: "User" },
  comment_content: { type: String, required: true },
  post_reference: { type: Schema.Types.ObjectId, ref: "Post" },
  likes_count: [{ type: Schema.Types.ObjectId, ref: "User" }],
  comment_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Comment", CommentSchema);
