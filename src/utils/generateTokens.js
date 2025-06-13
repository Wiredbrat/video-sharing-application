import { User } from '../models/user.model.js'

const genrateRefreshAndAccessToken = async (userId) => {
  try {
    const user = await User.findById(userId)
    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()
    
    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    
    return {accessToken, refreshToken}

  } catch (error) {
    throw new ApiErrors(500, "unable to process the request")
  }
}

export {genrateRefreshAndAccessToken}