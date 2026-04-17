import { TryCatch } from "../utils/TryCatch.js";
import ErrorHandler from "../utils/errorHandler.js";
import { sql } from "../utils/db.js";
import bcrypt from "bcrypt";

export const registerUser = TryCatch(async (req, res, next) => {
    const { name, email, password, role, bio, phoneNumber } = req.body;

    if (!name || !email || !password || !role || !bio || !phoneNumber) {
        throw new ErrorHandler("please fill all details", 400);
    }

    const existingUsers = await sql`SELECT user_id FROM users WHERE email = ${email}`;
    if (existingUsers.length > 0) {
        throw new ErrorHandler("User already exists", 400);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    let registeredUser;

    if (role === "recruiter") {
        const [user] = await sql`INSERT INTO users(name, email, password, role, phone_number) VALUES
        (${name}, ${email}, ${hashedPassword}, ${role}, ${phoneNumber}) RETURNING 
        user_id, name, email, role, phone_number, created_at`;

        registeredUser = user;
    } else if (role === "jobseeker") {
        const file = req.file;
        if (!file) {
            throw new ErrorHandler("Please upload your resume", 400);
        }
        const [user] = await sql`INSERT INTO users(name, email, password, role, phone_number) VALUES
        (${name}, ${email}, ${hashedPassword}, ${role}, ${phoneNumber}) RETURNING 
        user_id, name, email, role, phone_number created_at`;
    }

    res.json(email);
});

