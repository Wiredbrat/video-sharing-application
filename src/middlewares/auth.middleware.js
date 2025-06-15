import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiErrors } from "../utils/errorHandler.js";
import { User } from "../models/user.model.js";

const verifyToken = asyncHandler(async (req, _, next) => {
  try {
    const token = req.cookies?.accessToken || req.header("Authrization").replace("bearer ", "")
    if(!token) {
      throw new ApiErrors(401, "Unauthorized Request")
    }
  
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
  
    if(!user) {
      throw new ApiErrors(401, "Invalid Access Token")
  
    }
  
      req.user = user
      next()
  } catch(error) {
    throw new ApiErrors(401, error.message || "Invalid Access Token")
  }
})

export { verifyToken }