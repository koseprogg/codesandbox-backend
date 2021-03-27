const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    username: String,
    firstName: String,
    lastName: String,
    profilePicture: String,
    emailAddress: String,
  },
  {
    autoCreate: true,
  },
);

const UserModel = model('users', UserSchema);

module.exports = UserModel;
