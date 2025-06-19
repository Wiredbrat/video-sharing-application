import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiErrors } from '../utils/errorHandler.js'
import { User } from '../models/user.model.js'
import { uploadOnCloud } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/responseHandler.js'
import { genrateRefreshAndAccessToken } from '../utils/generateTokens.js'
import mongoose from 'mongoose'

// USER REGISTRATION FUNCTIONALITY
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
  const existingUser = await User.findOne({
    $or: [{ username }, { email }]
  })

  if(existingUser) {
    throw new ApiErrors(402, "username or email already registered")
  }

  //check for images, check for avatar 
  const avatarLocalPath = req.files?.avatar[0]?.path

  let coverImageLocalPath
  if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    coverImageLocalPath = req.files?.coverImage[0]?.path
  }
  if(!avatarLocalPath) {
    throw new ApiErrors(400, "avatar image is required")
  }
  console.log(avatarLocalPath)

  //upload them to cloudinary, check avatar again
  const avatar = await uploadOnCloud(avatarLocalPath)
  const coverImage = await uploadOnCloud(coverImageLocalPath)

  if(!avatar) {
    throw new ApiErrors(400, "avatar file is required")
  }
  console.log(avatar, coverImage)

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
  console.log(user)
  //return response
  return res.status(201).json(
    new ApiResponse(200, userCreated, "User Registered Successfully")
  )

})

// USER LOGIN FUNCTIONALTIY 
const loginUser = asyncHandler(async (req, res) => {
  // get data from frontend(user)
  const {password, email, username} = req.body

  // console.log(req.body)
  
  //check for username or email
  if(!username && !email) {
    throw new ApiErrors(400, "username or email is incorrect")
  }

  //find the user
  const user = await User.findOne({
    $or: [{ username }, { email }]
  })

  console.log(user)

  if(!user) {
    throw new ApiErrors(404, "User not found")
  }

  //check for password
  if(!password) {
    throw new ApiErrors(400, "password is incorrect")
  }
  console.log(user.isPasswordCorrect)
  const isPasswordValid = await user.isPasswordCorrect(password)

  if(!isPasswordValid) {
    throw new ApiErrors(400, "password is incorrect")
  }
  //generate refresh and access token
  const {accessToken, refreshToken} = await genrateRefreshAndAccessToken(user._id)

  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
  //send cookies

  const options = {
    secure: true,
    httpOnly: true
  }
  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
    new ApiResponse(200, {
      user: loggedInUser, 
      accessToken,
      refreshToken,
    }, "user logged in successfully")
  )
  //json is sent for the cases where cookie is inaccessible
})

// USER LOGOUT FUNCTIONALITY
const logoutUser = asyncHandler( async(req, res) => {
  User.findByIdAndUpdate(
    req.user._id, 
    {
      $unset: {
        refreshToken: 1  //this is to clear refersh token when user is logout
      }
    },
    {
      new: true
    }
  )

  const options = {
    httpOnly: true,
    secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", options)
  .cookie("refreshToken", options)
  .json(new ApiResponse(200, "User logged out Successfully"))
})

// TO REFRESH ACCESS TOKEN ON EXPIRATION
const refreshAccessToken = asyncHandler(async(req, res) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken) {
      throw new ApiErrors(401, "Unauthorized Request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.ACCESS_REFRESH_SECRET)
    const user = await User.findById(decodedToken?._id)

    if (!user) {
      throw new ApiErrors(401, "Invalid Refresh Token")
    }

    if(incomingRefreshToken !== user?.refreshToken) {
      throw new ApiErrors(401, "Refresh Token is Expired or Wrong")
    }

    const {newAccessToken, newRefreshToken} = await genrateRefreshAndAccessToken(user._id)

    const options = {
      httpOnly:true,
      secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", newAccessToken, options)
    .cookie("refreshToken", newRefreshToken, options)
    .josn(new ApiResponse(200, {
      newAccessToken,
      newRefreshToken
    },
    "New Refresh Token generated Successfully"
  )) 
  } catch (error) {
    throw new ApiErrors(401, error?.message || "invalid refresh token")
  }
})

// TO CHANGE CURRENT PASSWORD
const changeCurrentPassword = asyncHandler(async (req, res) => {
  console.log(req.body)
  const { oldPassword, newPassword, confirmPassword } = req.body
  const user = await User.findById(req.user?._id)
  console.log(user)
  const currUser = req.user
  console.log(":Current User",currUser)
  const isPasswordValid = user.isPasswordCorrect(oldPassword)
  
  if(!isPasswordValid) {
    throw new ApiErrors(401, "password is incorrect")
  }

  if(!newPassword.trim === '') {
    throw new ApiErrors(401, "password field can not be blank")
  } 

  if(newPassword !== confirmPassword) {
    throw new ApiErrors(401, "password does not match")
  }

  user.password = newPassword
  await user.save({
    validateBeforeSave: false
  })

  return res
  .status(200)
  .json(new ApiResponse(
    200,
    {},
    "Password Updated Successfully"
  ))
})

// TO GET CURRENT USER
const currentUser = asyncHandler(async(req, res) => {
  const currUser = await User.findById(req.user._id).select(" -password ")

  return res
  .status(200)
  .json(new ApiResponse(200, currUser, "Current user fetched successfully"))
})

// TO UPDATE THE USER DETAILS

const updateUserDetails = asyncHandler(async(req, res) => {
  const {email, username, fullName} = req.body 

  if(!email || !username || !fullName) {
    throw new ApiErrors(401, "fields can not be empty")
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id, 
    {
      $set: {
        email: email,
        fullName: fullName,
        username: username
      }
    },
    {new: true}
  ).select("-passowrd -refreshToken")

  return res.status(200)
  .json(new ApiResponse(200, updatedUser, "User Updated Successfully"))
})

// To UPDATE USER FILES (IMAGES)

const updateUserAvatar = asyncHandler(async(req, res) => {
  const avatarLocalPath = req.file.path

  console.log(avatarLocalPath)
  
  if(!avatarLocalPath) {
    throw new ApiErrors(401, "avatar image path not found")
  }

  const avatar = await uploadOnCloud(avatarLocalPath)

  if(!avatar.url) {
    throw new ApiErrors(500, "Error occured while uploading avatar")
  }
  // Assignment : add old image deletion code
  
  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {avatar: avatar.url}
    },
    {new: true}
  ).select("-password -refreshToken")

  return res.status(200)
  .json(new ApiResponse(200, {}, "Avatar file uploaded successfully"))
})

const updateUserCoverImage = asyncHandler(async(req, res) => {
  const coverImageLocalPath = req.file.path
  
  if(!coverImageLocalPath) {
    throw new ApiErrors(401, "cover image path not found")
  }

  const coverImage = await uploadOnCloud(coverImageLocalPath)

  if (coverImage.url) {
    throw new ApiErrors(500, "Error occured while uploading cover image")
  }

  await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {coverImage: coverImage.url}
    },
    {new: true}
  ).select("-password -refreshToken")

  return res.status(200)
  .josn(new ApiResponse(200, {}, "cover image file uploaded successfully"))
})

const getUserChannelProfile = asyncHandler(async(req, res) => {
  const {username} = req.params

  if(!username.trim()) {
    throw new ApiErrors(400, "Username is Missing")
  }

  const channel = await User.aggregate([
    {
      $match: {
        username: username?.toLowerCase()
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers"
      }
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo"
      }
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelSubscribedToCount: {
          $size: "$subscribedTo"
        },
        isSubscribed: {
          cond: {
            if: {$in: [req.user?._id, "$subscribers.subscriber"]},
            then: true,
            else: false
          }
        }
      }
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        subscribersCount: 1,
        channelSubscribedToCount: 1,
        avatar: 1,
        coverImage: 1,
        email: 1
      }
    }

  ])

  if(!channel?.length) {
    throw new ApiErrors(404, "channel does not exist")
  }

  return res
  .status(200)
  .json(new ApiResponse(
    200,
    channel[0],
    "Channel data fetched successfully"
  ))
})

const getWatchHistory = asyncHandler(async(req, res) => {
  const user = User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id)
      }
    },
    {
      $lookup:{
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                      fullName: 1,
                      username: 1,
                      avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: {
                $first: "owner"
              }
            }
          }
        ]
      } 
    }
  ])

  return res.
  status(200)
  .json(new ApiResponse(
    200, 
    user[0].getWatchHistory, 
    "watched history fetched successfully"
  ))
})

export {
  registerUser,
  loginUser, 
  logoutUser, 
  currentUser,
  refreshAccessToken, 
  changeCurrentPassword, 
  updateUserDetails, 
  updateUserAvatar, 
  updateUserCoverImage, 
  getUserChannelProfile,
  getWatchHistory
}