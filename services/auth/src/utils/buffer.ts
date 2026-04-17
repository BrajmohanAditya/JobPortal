import DataUriParser from "datauri/parser.js";

import path from "path";


const parser = new DataUriParser();

const getBuffer = (file: any) => {
    const parser = new DataUriParser();

    const extName = path.extname(file.originalname).toString();
    return parser.format(extName, file.buffer);
}

export default getBuffer;

/*
buffer.ts ki Entry (The Translator) 

buffer.ts ek translator hai jo Multer ke raw RAM data (jo bhejne mein mushkil hai)
ko pakad kar ek safe Text String (Data URI) mein badal deta hai taaki aap usko easily
internet ke zariye dusre server (Upload Service / Cloudinary) ko JSON ke andar bhej 
sakein.
*/