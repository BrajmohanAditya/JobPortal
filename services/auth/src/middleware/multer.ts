import multer from "multer";

const storrage = multer.memoryStorage();

const uploadFile = multer({ storage: storrage }).single("file");

export default uploadFile;

/*
> Postman ne PDF bheja.

> Multer ne us PDF ko catch kiya aur aapke Node.js server ki RAM (memory) mein 
hold kar liya (memoryStorage).

> Phir aapka code us RAM mein rakhe hue PDF Buffer ko uthata hai.

> Aur final step mein, aapka code us PDF ko Cloudinary par bhejta hai 

*/


