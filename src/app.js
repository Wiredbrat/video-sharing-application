import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

//middleware for accessing cross origin resources without error
app.use(cors({
  origin: process.env.CORS_ORIGIN_URL,
  credentials: true,
}));

//middleware for accessing json data and limiting its response
app.use(express.json({
  limit: '24kb',  
}));

//middleware for accessing data from url body and limiting its response
app.use(urlencoded({
  extended: true,
  limit: '24kb',
}))

//middleware to save and access data from cookies
app.use(cookieParser());

export default app