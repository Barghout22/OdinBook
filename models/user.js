const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  accountId: { type: String, required: true },
  name: { type: String, required: true, maxLength: 100 },
  profile_picture: { type: String },
  about: { type: String, maxLength: 500 },
  friends: [{ type: Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
      status: { type: String, enum: ["sent request", "received request"] },
    },
  ],
});
UserSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/users/${this._id}`;
});

module.exports = mongoose.model("User", UserSchema);
