import mongoose, { Schema } from "mongoose";

const playlistSchema = Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
    maxLength: 500
  },
  videos: {
    type: Schema.Types.ObjectId,
    ref: "Video"
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User"
  }
  
}, {timeStamps: true})

export const Playlist = mongoose.model("Playlist", playlistSchema)