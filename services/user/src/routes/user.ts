import express from "express";
import dotenv from "dotenv";
import { myProfile } from "../controllers/user.js";
import { isAuth } from "../middleware/auth.js";

dotenv.config();
const router = express.Router();

router.get("/me", isAuth, myProfile);

export default router;

