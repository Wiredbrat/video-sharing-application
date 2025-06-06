import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";

dotenv.config()
const dbConnection = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.DB_URI}/${process.env.DB_NAME}`);
    console.log(`Database Connected! DB HOST:${connectionInstance.connection.host}`) //connectionInstance[storing value returned from mongoose.connect()] is a object in which data is stored in properties one such property is 'connection.host'

  } catch (error) {
    console.error("ERROR: ", error)
    process.exit(1) //this is a inbuilt node method which is used to end the process with code i.e., 0,1 etc.
  }
}


export default dbConnection