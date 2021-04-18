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

// set up our multer to use the gridfs storage defined above
const store = multer({
  storage,
  // limit the size to 20mb for any files coming in
  limits: { fileSize: 20000000 },
  // filer out invalid filetypes
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

function checkFileType(file, cb) {
  // https://youtu.be/9Qzmri1WaaE?t=1515
  // define a regex that includes the file types we accept
  const filetypes = /jpeg|jpg|png|gif/;
  //check the file extention
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // more importantly, check the mimetype
  const mimetype = filetypes.test(file.mimetype);
  // if both are good then continue
  if (mimetype && extname) return cb(null, true);
  // otherwise, return error message
  cb('filetype');
}

const uploadMiddleware = (req, res, next) => {
  const upload = store.single('image');
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      // a multer error occurred when uploading because of the size limit
      return res.status(400).send('File too large');
    } else if (err) {
      // check if our filetype error occurred
      if (err === 'filetype') return res.status(400).send('Image files only');
      // An unknown error occurred when uploading.
      return res.sendStatus(500);
    }
    // all good, proceed
    next();
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
  // we can set other, smaller file size limits on routes that use the upload middleware
  //
  // make this limit larger if you are accepting video content or very high quality pictures
  // 5mb is an arbitrary value that I think is a good limit for profile pictures and cover photos
  if (file.size > 1000000) {
    // if the file is too large, delete it and send an error
    deleteImage(id);
    return res.status(400).send('file may not exceed 5m');
  }
  console.log('uploaded file: ', file);
  return res.send(file.id);
});

const deleteImage = (id) => {
  if (!id || id === 'undefined') return res.status(400).send('no image id');
  const _id = new mongoose.Types.ObjectId(id);
  gfs.delete(_id, (err) => {
    if (err) {
      return res.status(500).send('image deletion error');
    }
  });
};

module.exports = router;
