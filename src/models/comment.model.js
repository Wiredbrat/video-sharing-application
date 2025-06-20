import mongoose, {Schema} from "mongoose"

const commentSchema = Schema({
  content: {
    type: String,
    required: true,
    maxLength: 500
  },
  video: {
    type: Schema.Types.ObjectId,
    ref: "Video",
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  }
})

export const Comment = mongoose.model("Comment", commentSchema)