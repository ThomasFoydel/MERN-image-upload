// example of what an integration into a simple social media app might look like
// this demo shows the updating of a user's profile picture
// but virtually the same approach can be taken to
// posts or messages which contain images

const mongoose = require('mongoose');
const GridFsStorage = require('multer-gridfs-storage');
const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

// import auth middle ware to get userid from jwt token
const auth = require('../middleware/auth');
// import User model to update user document's profile picture
const User = require('./models/User');

const mongoURI = process.env.MONGO_URI;
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;
conn.once('open', () => {
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: 'images',
  });
});
const storage = new GridFsStorage({
  url: mongoURI,
  options: { useUnifiedTopology: true },
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'images',
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({
  storage,
});

const deleteImage = (id) => {
  if (!id || id === 'undefined') return res.send({ err: 'no image id' });
  const _id = new mongoose.Types.ObjectId(id);
  gfs.delete(_id, (err) => {
    if (err) {
      return res.send({ err: 'image deletion error' });
    }
  });
};

router.get('/:id', ({ params: { id } }, res) => {
  if (!id || id === 'undefined') return res.send({ err: 'no image id' });
  const _id = new mongoose.Types.ObjectId(id);
  gfs.find({ _id }).toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.send({ err: 'no files exist' });
    }
    gfs.openDownloadStream(_id).pipe(res);
  });
});

router.post(
  '/change-profilepic',
  auth,
  upload.single('image'),
  async (req, res) => {
    const { file } = req;

    // get userId that was added to req by the auth middleware
    const userId = req.tokenUser.userId;

    const { id } = file;
    if (file.size > 5000000) {
      deleteImage(id);
      return res.send({ err: 'file may not exceed 5mb' });
    }

    // find the user with the id that matches the token
    const foundUser = await User.findById(userId);
    // if no user found, send an error
    if (!foundUser) return res.send({ err: 'user not found' });
    let currentPic = foundUser.profilePic;
    // if a user currently has a profile picture, delete the old one if you
    // want to limit user's to one profile pic to save space
    if (currentPic) {
      let currentPicId;
      try {
        currentPicId = new mongoose.Types.ObjectId(currentPic);
      } catch (err) {
        console.log('invalid id: ', currentPic);
      }
      gfs.delete(currentPicId, (err) => {
        if (err) {
          return res.send({ err: 'database error' });
        }
      });
    }

    // update user's profile pic to id
    // return updated user document
    User.findByIdAndUpdate(
      userId,
      { profilePic: id },
      { useFindAndModify: false }
    )
      .then((user) => res.send(user.profilePic))
      .catch(() => {
        return res.send({ err: 'database error' });
      });

    // alternatively, instead of deleting the current pic, you could just
    // add its id to a list of previous pictures
    // while setting the new profile pic like
    // User.findByIdAndUpdate(userId,
    //   { $push: {previousPics: [currentPic]}, $set:{profilePic: id }},
    //    {useFindAndModify: false})
    //   .then((user) => res.send(user.profilePic))
    //   .catch(() => {
    //     return res.send({ err: 'database error' });
    //   });
  }
);

module.exports = router;
