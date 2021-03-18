import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const mongoUri = process.env.MONGODB_URI;
const mongoUriProd = process.env.MONGODB_PROD_URI;

const connectToMongoDb = () => {
  mongoose.connect(
    mongoUriProd || mongoUri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  ).catch((err) => console.log(err));
};

export default connectToMongoDb;
