import jwt from "jsonwebtoken";
import User from "../model/User.js"

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_here";

export default async function authMiddleware(req, res, next) {
    // Grab the Bearer token from Authorization Header
    const authHeader = req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            success:false,
            message:"Not authorize token missing"
        });
    }

    const token = authHeader.split(" ")[1];
    // VERIFY & ATTACH OBJECT

    try{
           const payload = jwt.verify(token , JWT_SECRET);
           const user = await User.findById(payload.id).select("-password");

           if(!user){
               return res.status(401).json({
                success:false,
                message:"User not found",
               })
           }

           req.user = user;
           next()

    }
    catch(error){
          console.log("Jwt verification failed" , error)
          return res.status(401).json({success:false , 
            message:"Token invalid of expired"
          })
    }

}