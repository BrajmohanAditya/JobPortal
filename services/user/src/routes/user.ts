import express from "express";
import dotenv from "dotenv";
import { getUserProfile, myProfile } from "../controllers/user.js";
import { isAuth } from "../middleware/auth.js";

dotenv.config();
const router = express.Router();

router.get("/me", isAuth, myProfile);
router.get("/:userId", isAuth, getUserProfile);
export default router;

