import mongoose, { Schema } from "mongoose";

const videoSchema = new Schema({
  id: {
    type: String,
  },
  videoFile: {
    type: String, // cloudinary url
    required: [true, 'Video is must'],
  },
  thumbnail: {
    type: String, // cloudinary url
    required: [true, 'Thumbnail of video is must'],
  },
  title: {
    type: String,
    required: [true, 'Write a Title for video']
  },
  description: {
    type: String,
  },
  duration: {
    type: Number, //will be available on cloudinary after video upload
    required: true
  },
  views: {
    type: Number,
    default: 0,
  },
  isPublished: {
    type: Boolean,
    default: true,
    enum: [true, false]
  },
  ownerName: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {timestamps: true})

export const Video = mongoose.model('Video', videoSchema)