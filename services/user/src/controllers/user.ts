import { TryCatch } from "../utils/TryCatch.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

export const myProfile = TryCatch(async (req:AuthenticatedRequest,res,next)=>{
    const user = req.user;

   res.json(user);
    
})