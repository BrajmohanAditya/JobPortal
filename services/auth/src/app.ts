import express from 'express';
import authRoutes from "./routes/auth.js"

const app = express();
app.use(express.json()); // for parsing json data

app.use("/api/auth", authRoutes);

export default app;

