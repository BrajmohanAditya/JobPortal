import app from "./app.js";
import dotenv from "dotenv";
import { sql } from "./utils/db.js";

dotenv.config();

async function initDb() {
  try {
    await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'user');
      END IF;
    END
    $$;`;

    await sql`
    CREATE TABLE IF NOT EXISTS users (
      user_id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      phone_number VARCHAR(20) NOT NULL,
      role user_role NOT NULL,
      bio TEXT,
      resume varchar(255),
      resume_public_id varchar(255),
      profile_pic varchar(255),
      profile_pic_public_id varchar(255),
      created_at TIMESTAMPTZ not NULL DEFAULT NOW(),
      subscription TIMESTAMPTZ

    );`;

    await sql`
    CREATE TABLE IF NOT EXISTS skills(
      skill_id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE
    );`;
    await sql`
      CREATE TABLE IF NOT EXISTS user_skills(
      user_id INT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      skill_id INT NOT NULL REFERENCES skills(skill_id) ON DELETE CASCADE,
      PRIMARY KEY (user_id, skill_id)
    )`;
    console.log("✅ Database initialized successfully");
  } catch (err) {
    console.error("❌ Error initializing database:", err);
    process.exit(1);
  }
}

initDb().then(() => {
  app.listen(process.env.PORT, () => {
    console.log(`Auth service is running on http://localhost:${process.env.PORT}`);
  });
})


/*
Example Data (Real samajh)

👤 users table
user_id | name
----------------
1       | Mohan
2       | Aditya


🧠 skills table
skill_id | name
----------------
1        | Java
2        | React
3        | Node.js

🔥 user_skills table (FINAL OUTPUT)


user_id | skill_id
-------------------
1       | 1   (Mohan → Java)
1       | 2   (Mohan → React)
2       | 2   (Aditya → React)
2       | 3   (Aditya → Node.js)

👉 ON DELETE CASCADE ka matlab:

Parent record delete hoga → related child records automatically delete ho jayenge

*/
