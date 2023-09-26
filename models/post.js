const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  postingUser: { type: Schema.Types.ObjectId, ref: "User" },
  postBody: { type: String, required: true },
  timeStamp: { type: Date, Default: new Date() },
  likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
});
PostSchema.virtual("url").get(function () {
  return `/posts/${this._id}`;
});

module.exports = mongoose.model("Post", PostSchema);
