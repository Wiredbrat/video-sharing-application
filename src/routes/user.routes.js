import { Router } from "express";
import { 
  loginUser, 
  registerUser, 
  logoutUser, 
  currentUser,
  refreshAccessToken, 
  changeCurrentPassword, 
  updateUserDetails, 
  updateUserAvatar, 
  updateUserCoverImage, 
  getUserChannelProfile,
  getWatchHistory 
} from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyToken } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
  upload.fields([
    {
      name: 'avatar',
      maxCount: 1,
    },
    {
      name: 'coverImage',
      maxCount: 1,
    }
  ]),  
  registerUser
)

router.route("/login").post(loginUser)

//Secured Routes
router.route("/logout").post(verifyToken, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyToken, changeCurrentPassword)
router.route("/current-user").get(verifyToken, currentUser) //not working
router.route("/update-user-details").patch(verifyToken, updateUserDetails)
router.route("/update-user-avatar").patch(verifyToken, upload.single('avatar'), updateUserAvatar)
router.route("/update-user-coverimage").patch(verifyToken, upload.single('coverImage'), updateUserCoverImage)
router.route("channel/:username").get(verifyToken, getUserChannelProfile)
router.route("/watch-history").get(verifyToken, getWatchHistory)
export default router