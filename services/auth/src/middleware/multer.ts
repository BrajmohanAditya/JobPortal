import multer from "multer";

const storrage = multer.memoryStorage();

const uploadFile = multer({ storage: storrage }).single("file");

export default uploadFile;

