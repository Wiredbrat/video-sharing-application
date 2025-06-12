import mongoose, {Schema} from "mongoose";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true, //this property is used on the fields which are to be made searchable (provides search optimization)
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  id: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  avatar: {
    type: String, // cloudinary url
    required: true
  },
  coverImage: {
    type: String, // cloudinary url
  },
  watchHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    }
  ],
  refreshToken: {
    type: String,
  }

}, {timestamps: true})

//middleware for encrypting password using bcrypt 
userSchema.pre("save", async function(next) {
  // if(!this.isModified('password')) return next()  
  // this.password = await bcrypt.hash(this.password, 10)
  // next()

  //use above method or this
  if(this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  }else{
    return next();
  }
})

//custom method in schema model to check the encrypted password
userSchema.methods.IsPasswordCorrect = async function(password) {
  return await bcrypt.compare(password, this.password)
}

//custom method in schema model for generating access token (NOTE: method can be asynchronous)
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    }
  )
}

//custom method in schema model for generating refresh token (NOTE: method can be asynchronous)
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    }
  )
}

export const User = mongoose.model('User', userSchema)
