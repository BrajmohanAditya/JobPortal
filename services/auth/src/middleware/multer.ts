import multer from "multer";

const storrage = multer.memoryStorage();

const uploadFile = multer({ storage: storrage }).single("file");

export default uploadFile;

/*
✅ Solution → MULTER

👉 Multer middleware:

Incoming file ko read karta hai
Process karta hai
req.file ya req.files mein daal deta hai
*/

