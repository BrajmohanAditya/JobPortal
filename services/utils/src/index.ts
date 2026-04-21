import express from 'express'
import dotenv from 'dotenv'
import routes from './routes.js'
import cors from 'cors'
import { v2 as cloudinary } from 'cloudinary';
import { startSendMailConsumer } from "./consumer.js"

dotenv.config();
startSendMailConsumer();

// establishing connection to cloudinary. 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const app = express();


app.use(cors());

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/utils', routes);


app.listen(process.env.PORT, () => {
    console.log(`Utils service is running on http://localhost:${process.env.PORT}`);
});

/*
app.use(express.json({ limit: '50mb' }));

Agar kisi ne data JSON format mein bheja hai (jaise { "name": "Aditya" }), 
toh Express default roop se isko nahi samajhta. Ye line us raw JSON text ko 
pakadti hai aur Javascript object mein badal kar aapko req.body ke andar de 
deti hai.
*/