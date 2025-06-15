import mongoose from "mongoose";
import dotenv from "dotenv";
import { DB_NAME } from "../constants.js";
import { User } from "../models/user.model.js";

dotenv.config()
const dbConnection = async () => {
  try {
    const connectionInstance = await mongoose.connect(`${process.env.DB_URI}/${process.env.DB_NAME}`, {autoIndex: false});
    console.log(`Database Connected! DB HOST:${connectionInstance.connection.host}`) //connectionInstance[storing value returned from mongoose.connect()] is a object in which data is stored in properties one such property is 'connection.host'
    // await User.collection.dropIndex('id_1') // this is for removing unique property from the id key of user (to be used once only)
  } catch (error) {
    console.error("ERROR: ", error)
    process.exit(1) //this is a inbuilt node method which is used to end the process with code i.e., 0,1 etc.
  }
}



export default dbConnection