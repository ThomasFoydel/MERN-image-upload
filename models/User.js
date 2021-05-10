const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
  },
  previousPictures: {
    type: [String],
  },
  password: {
    type: String,
    required: [true, 'Password required'],
    select: false,
  },
});

module.exports = mongoose.model('User', userSchema);
