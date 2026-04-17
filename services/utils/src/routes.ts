import express from "express";
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

router.post('/upload', async (req, res) => {
    try {
        const { buffer, public_id } = req.body;

        if (public_id) {
            await cloudinary.uploader.destroy(public_id);
        }

        // Add your upload logic here if needed...
        const cloud = await cloudinary.uploader.upload(buffer, {
            folder: 'uploads',
            public_id: public_id
        })

        return res.json({
            message: 'Success',
            data: cloud
        })

    } catch (error: any) {
        res.status(500).json({ message: error.message })
    }
});

export default router;
