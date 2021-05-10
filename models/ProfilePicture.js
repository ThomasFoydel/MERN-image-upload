const mongoose = require('mongoose');

const profilePictureSchema = mongoose.Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    likes: {
      type: [mongoose.Types.ObjectId],
      ref: 'User',
    },
    fileId: {
      type: String,
      required: true,
    },
    comments: {
      type: [mongoose.Types.ObjectId],
      ref: 'Comment',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ProfilePicture', profilePictureSchema);
