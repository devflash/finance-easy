import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URL}/financeEasy`);
  } catch (error) {
    console.log("Mongo database connection error", error);
  }
};
