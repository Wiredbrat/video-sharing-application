// import mongoose from "mongoose";
// import { DB_NAME } from "./constants.js";
import dotenv from "dotenv";
import express from "express"
import dbConnection from "./db/db.js";
import app from "./app.js";

dotenv.config();
const port = process.env.PORT || 3000;

// returns a promise
dbConnection()
.then(() => {
  app.on('error', (error) => {
    console.log('Database connention error', error);
  })
})
.then(() => {
  app.listen(port, () => {
    console.log('app is listening on port:', port);
  })
})
.catch((error) => {
  console.log('Connection Error:', error);
})







//This method connects the db and creates server in the same file which is not wrong but pollutes the file and reduces code modularity
/*
const app = express()

;( async() => {
  try {
    await mongoose.connect(`${process.env.DB_URI}/${DB_NAME}`)
    app.on('error', (error) => {
      console.log('ERROR: ', error);
      throw error;
    })

    app.listen(process.env.PORT, () => {
      console.log('App is listening on PORT: ', process.env.PORT)
    })
  } catch (error) {
    console.error('ERROR: ', error);
    throw error;
  }
})()

*/