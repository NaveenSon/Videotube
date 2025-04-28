import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req,  _ ,next)=>{
//here res is not used then we write on instead it _
try {
    const token = req.cookies?.accessToken || req.header("Authorization")?.split(" ")[1]
    
    
    if(!token){
        throw new ApiError(401, "Unauthorized request")
    }
    
       const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    
     const user=  await User.findById(decodedToken?._id).select("-password -refreshToken"
      )
    
      if(!user)
      {
        throw new ApiError(401, "Invalid Access Token")
      }
    
    
      req.user =user;
        next();
} catch (error) {
     throw new ApiError(401, error?.message || "Invalid access Token")
}

})

//here we can get req.cookie grt via app.use ("cookie parser")
//?. itn means optional 
//in mobile applicaitons user can send via in header thats why we  guev or opertor