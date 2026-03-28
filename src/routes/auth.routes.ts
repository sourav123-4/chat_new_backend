import express from "express";
import { auth } from "../middlewares/auth.middleware";
import { 
  changePassword,
  deleteAccount,
  getProfile,
  login,
  logout,
  signup,
  updateProfile,
  searchUsers,
  getAllUsers,
  refreshToken,
  verifyEmail,
  forgotPassword,
  resetPassword,
  verifyOtp,
  googleSignIn
} from "../controllers/auth.controller";

import { upload } from "../middlewares/multer";

const router = express.Router();

// Auth
router.post("/signup", upload.single("avatar"), signup);
router.post("/login", login);
router.post("/google-signin", googleSignIn);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/verify-email", verifyEmail);

// Profile
router.get("/profile", auth, getProfile);
router.put(
  "/profile",
  auth,
  upload.single("avatar"), // optional image upload
  updateProfile
);

// Account Actions
router.put("/change-password", auth, changePassword);
router.delete("/delete", auth, deleteAccount);
router.post("/logout", auth, logout);

// User Utility
router.get("/search", auth, searchUsers);
router.get("/all", auth, getAllUsers);

export default router;
