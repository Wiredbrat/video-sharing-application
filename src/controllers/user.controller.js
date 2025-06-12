import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiErrors } from '../utils/errorHandler.js'
import { User } from '../models/user.model.js'
import { uploadOnCloud } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/responseHandler.js'

const registerUser = asyncHandler(async (req, res) => {
  //get user details from frontend

  const {username, email, password, fullName} = req.body
  // console.log("Email: ",email)
   
  //validation - if empty or not
  if(
    [username, email, password, fullName].some(field => field.trim() === "")
  ) {
    throw new ApiErrors(400, "all Fields are mandatory")
  }
  //check if user already exists (using email and username)
  const existingUser = User.findOne({
    $or: [{ username }, { email }]
  })

  if(existingUser) {
    throw new ApiErrors(402, "username or email already registered")
  }

  //check for images, check for avatar 
  const avatarLocalPath = req.files?.avatar[0]?.path
  const coverImageLocalPath = req.files?.coverImage[0]?.path || ""

  if(!avatarLocalPath) {
    throw new ApiErrors(400, "avatar image is required")
  }

  //upload them to cloudinary, check avatar again
  const avatar = await uploadOnCloud(avatarLocalPath)
  const coverImage = await uploadOnCloud(coverImageLocalPath)

  if(!avatar) {
    throw new ApiErrors(400, "avatar file is required")
  }

  //create user object - create entry in db
  const user = await User.create({
    username,
    fullName: fullName.toLowerCase(),
    email,
    password,
    avatar: avatar?.url,
    coverImage: coverImage?.url || ""
  })

  //remove password and refreshToken
  const userCreated = await User.findById(user._id).select( "-password -refreshToken")

  //check if user created
  if(!userCreated) {
    throw new ApiErrors(500, "something went wrong while registering the user")
  }
  
  //return response
  return res.status(201).json(
    new ApiResponse(200, userCreated, "User Registered Successfully")
  )
  
})

export {registerUser}