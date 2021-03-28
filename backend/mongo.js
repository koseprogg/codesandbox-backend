const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
const mongoUriProd = process.env.MONGODB_PROD_URI;

const connectToMongoDb = () => {
  mongoose
    .connect(mongoUriProd || mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    })
    .catch((err) => console.error(err));
};

module.exports = connectToMongoDb;
