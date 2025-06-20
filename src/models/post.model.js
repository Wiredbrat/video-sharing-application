import mongoose, { Schema } from "mongoose";

const postSchema = Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  },
  textContent: {
    type: String,
    maxLength: 2000
  },
  imageContent: {
    type: String,
  }
}, {timeStamps: true})

export const Post = mongoose.model("Post", postSchema)