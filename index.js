const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const imageRoutes = require('./routes/image.js');
const port = process.env.PORT || 8000;

require('dotenv').config();
app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/api/image', imageRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/build'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

// be sure to set your MONGO_URI in a .env file in both the root folder of your project
// and in the config variables section on Heroku, in the settings page for your app
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}!`);
    });
  });
