import { TryCatch } from "../utils/TryCatch.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sql } from "../utils/db.js";
import bcrypt from "bcrypt";
import getBuffer from "../utils/buffer.js";
import axios from "axios";
import jwt from "jsonwebtoken";

export const registerUser = TryCatch(async (req, res, next) => {
  const { name, email, password, role, bio, phoneNumber } = req.body;

  if (!name || !email || !password || !role || !bio || !phoneNumber) {
    throw new ErrorHandler("please fill all details", 400);
  }

  const existingUsers =
    await sql`SELECT user_id FROM users WHERE email = ${email}`;
  if (existingUsers.length > 0) {
    throw new ErrorHandler("User already exists", 400);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  let registeredUser;

  if (role === "recruiter") {
    const [user] =
      await sql`INSERT INTO users(name, email, password, role, phone_number) VALUES
        (${name}, ${email}, ${hashedPassword}, ${role}, ${phoneNumber}) RETURNING 
        user_id, name, email, role, phone_number, created_at`;

    registeredUser = user;
  } else if (role === "jobseeker") {
    const file = req.file;
    if (!file) {
      throw new ErrorHandler("Please upload your resume", 400);
    }

    const fileBuffer = getBuffer(file);
    if (!fileBuffer || !fileBuffer.content) {
      throw new ErrorHandler("fail to generate buffer", 500);
    }
    const { data } = await axios.post(
      `${process.env.UPLOAD_SERVICE}/api/utils/upload`,
      { buffer: fileBuffer.content },
    );
    const [user] =
      await sql`INSERT INTO users(name, email, password, role, phone_number, bio, resume, resume_public_id) VALUES
        (${name}, ${email}, ${hashedPassword}, ${role}, ${phoneNumber}, ${bio}, ${data.data.secure_url}, ${data.data.public_id}) RETURNING 
        user_id, name, email, role, phone_number, resume, bio, created_at`;

    registeredUser = user;
  }

  const token = jwt.sign({ id: registeredUser?.user_id },
    process.env.JWT_SECRET as string, { expiresIn: "15d" })


  res.json({
    message: 'User registered successfully',
    registeredUser,
    token
  });
});


export const loginUser = TryCatch(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ErrorHandler("please fill all details", 400);
  }

  const user = await sql`
  SELECT u.user_id, u.name, u.email, u.password, u.role, u.phone_number,
  u.bio, u.resume, u.profile_pic, u.subscription, ARRAY_AGG(s.name) 
  FILTER (WHERE s.name IS NOT NULL) as skills FROM users u LEFT JOIN user_skills 
  us ON u.user_id = us.user_id LEFT JOIN skills s ON us.skill_id = s.skill_id  
  WHERE u.email = ${email} GROUP BY u.user_id`
})



/*
  const file = req.file; this line store file details into variable file. file 
  is inside RAM and RAM mein file ko multer rakhta hai. 

*/