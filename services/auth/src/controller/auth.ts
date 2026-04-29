import { TryCatch } from "../utils/TryCatch.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sql } from "../utils/db.js";
import bcrypt from "bcrypt";
import getBuffer from "../utils/buffer.js";
import axios from "axios";
import jwt from "jsonwebtoken";
import { forgotPasswordTemplate } from "../templet.js";
import { publishToTopic } from "../producer.js";
import { redisClient } from "../index.js";
   

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

// LoginUser

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

  if (user.length === 0) {
    throw new ErrorHandler("Invalid credentials", 404);
  }

  const userObject = user[0];
  const matchPassword = await bcrypt.compare(password, userObject.password);

  if (!matchPassword) {
    throw new ErrorHandler("Invalid credentials", 401);
  }

  userObject.skills = userObject.skills || [];
  delete userObject.password;

  const token = jwt.sign({ id: userObject?.user_id },
    process.env.JWT_SECRET as string, { expiresIn: "15d" })


  res.json({
    message: 'User logged in successfully',
    user: userObject,
    token
  });
  // u- user table, us- user_skills table, s- skills table
})

// Forgot password 

export const forgotPassword = TryCatch(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    throw new ErrorHandler("Please enter your email", 400);
  }

  const users = await sql`SELECT user_id, email FROM users WHERE email = ${email}`;

  if (users.length === 0) {
    return res.json({
      message: "user doesnt exists"
    })
  }

  const user = users[0];

  const resetToken = jwt.sign(
    {
      email: user.email,
      type: "reset",
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "15m",
    }
  )


  const resetLink = `${process.env.FRONTEND_URL}/reset/${resetToken}`;

  await redisClient.set(`forgot:${email}`, resetToken, {
    EX: 900,
  })

  const message = {
    to: email,
    subject: "Reset Password",
    html: forgotPasswordTemplate(resetLink)
  }


  await publishToTopic("send-mail", message);

  res.json({
    message: "Password reset link sent to your email"
  })
})


export const resetPassword = TryCatch(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;

  let decoded: any;
  try {
    decoded = jwt.verify(token as string, process.env.JWT_SECRET as string)
  } catch (error) {
    throw new ErrorHandler("Expired token", 400)
  }

  if (decoded.type !== "reset") {
    throw new ErrorHandler("Invalid token", 400)
  }

  const email = decoded.email

  const storedToken = await redisClient.get(`forgot:${email}`)

  if (!storedToken || storedToken !== token) {
    throw new ErrorHandler("token has been expired", 400)
  }

  const users = await sql`SELECT user_id,email FROM users WHERE email = ${email}`;
  if (users.length === 0) {
    throw new ErrorHandler("User not found", 404)
  }

  const user = users[0];

  const hashedPassword = await bcrypt.hash(password, 10);

  await sql`UPDATE users SET password = ${hashedPassword} WHERE user_id = ${user.user_id}`;

  await redisClient.del(`forgot:${email}`);

  res.json({
    message: "Password reset successfully"
  })
})





/*
  const file = req.file; this line store file details into variable file. file 
  is inside RAM and RAM mein file ko multer rakhta hai. 



  👤 User1   👤 User2   👤 User3   👤 User4   👤 User5
   |          |          |          |          |
   ----------- API Server (Producer) ----------
                        |
                        v
                📦 Kafka Queue (Topic)
          ---------------------------------
          |   Msg1   Msg2   Msg3   Msg4   Msg5 |
          ---------------------------------
              |        |        |
              v        v        v
        📧 Worker1  📧 Worker2  📧 Worker3
           |           |           |
           v           v           v
        Email1     Email2     Email3 ...


    without kafka

👤 User1   👤 User2   👤 User3   👤 User4   👤 User5
   |          |          |          |          |
   ----------- API Server -----------
   |          |          |          |          |
   v          v          v          v          v
                📧 Email Service  
                        |
                        v
                Sending Emails (ONE BY ONE)

Flow:
User1 → wait → email sent
User2 → wait → email sent
User3 → wait → email sent
...

...
*/