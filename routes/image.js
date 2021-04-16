const mongoose = require('mongoose');
const GridFsStorage = require('multer-gridfs-storage');
const router = require('express').Router();
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
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
    // this function runs every time a new file is created
    return new Promise((resolve, reject) => {
      // use the crypto package to generate some random hex bytes
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        // turn the random bytes into a string and add the file extention at the end of it (.png or .jpg)
        // this way our file names will not collide if someone uploads the same file twice
        const filename = buf.toString('hex') + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: 'images',
        };
        // resolve these properties so they will be added to the new file document
        resolve(fileInfo);
      });
    });
  },
});

const store = multer({
  storage,
  // limit the size to 10mb for any files coming in
  limits: { fileSize: 10000000 },
});
const uploadMiddleware = (req, res, next) => {
  const upload = store.single('image');
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading.
      return res.status(400).send('file too large');
    } else if (err) {
      // An unknown error occurred when uploading.
      return res.sendStatus(500);
    }
    // all good, proceed
    next();
  });
};
multer({
  storage,
  // limit the size to 20mb for any files coming in
  limits: { fileSize: 1000000 },
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

// this route will be accessed by any img tags on the front end which have
// src tags like
// <img src="/api/image/123456789" alt="example"/>
// <img src={`/api/image/${user.profilePic}`} alt="example"/>
router.get('/:id', ({ params: { id } }, res) => {
  // if no id return error
  if (!id || id === 'undefined') return res.send({ err: 'no image id' });
  // if there is an id string, cast it to mongoose's objectId type
  const _id = new mongoose.Types.ObjectId(id);
  // search for the image by id
  gfs.find({ _id }).toArray((err, files) => {
    if (!files || files.length === 0) {
      return res.send({ err: 'no files exist' });
    }
    // if a file exists, send the data
    gfs.openDownloadStream(_id).pipe(res);
  });
});

router.post('/upload/', uploadMiddleware, async (req, res) => {
  // get the .file property from req that was added by the upload middleware
  const { file } = req;
  // and the id of that new image file
  const { id } = file;
  // make this limit larger if you are accepting video content or very high quality pictures
  // 5mb is an arbitrary value that I think is a good limit for profile pictures and cover photos
  if (file.size > 5000000) {
    // if the file is too large, delete it and send an error
    deleteImage(id);
    return res.send({ err: 'file may not exceed 5mb' });
  }
  console.log('uploaded file: ', file);
  return res.send(file.id);
});

module.exports = router;
