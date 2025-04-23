// import { asyncHandler } from "../utils/asyncHandler.js";
// import { ApiError } from "../utils/ApiError.js";
// import { User } from "../models/user.model.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
// import { ApiResponse } from "../utils/ApiResponse.js";

// const registerUser = asyncHandler(async (req, res, next) => {
// //   res.status(200).json({ message: "rom rom bhaiyo" });
//   const { fullName, email, username, password } = req.body;
//   if (fullName === "" || email === "" || username === "" || password === "")
//     return next(new ApiError(400, "All fields are required"));

//   User.findOne({
//     $or: [{ email }, { username }, { fullName }],
//   }).then((existingUser) => {
//     if (existingUser) {
//       let duplicateField = "";

//       if (existingUser.email === email) {
//         duplicateField = "Email";
//       } else if (existingUser.username === username) {
//         duplicateField = "Username";
//       } else if (existingUser.fullName === fullName) {
//         duplicateField = "Full name";
//       }

//       return next(new ApiError(400, `${duplicateField} already exists`));
//     }
//   const avatarlocalPath =  req.files?.avatar[0]?.path ;
//   const coverImagelocalPath =   req.files?.coverImage[0]?.path 

//     if (!avatarlocalPath ) {
//       return next(new ApiError(400, "Avatar image are required"));
//     }

//   const avatar = await uploadOnCloudinary(avatarlocalPath)

//   const coverImage = await uploadOnCloudinary(coverImagelocalPath)

//   if (!avatar ) {
//     return next(new ApiError(400, "Avatar image are required"));
//   }

//   const user =  await User.create({ fullName, 
        
//         avatar:avatar.url , 
//         coverImage:coverImage?.url || "", 
//         email, username, password }).then((user) => {
//       res.status(201).json({ message: "User created successfully", user });
//     });
//     const createdUser = await User.findById(newUser._id).select(
//         "-password -refreshToken"
//       );
    
//       if (!createdUser) {
//         return next(new ApiError(500, "User not found "));
//       }
    

// return res.status(201).json(new ApiResponse(201, "User created successfully", createdUser));
// });
// };
// export { registerUser };

//awlays make comment that what youy are required for write logic from forntend

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Register new user
const registerUser = asyncHandler(async (req, res, next) => {
  const { fullName, email, username, password } = req.body;

  // ✅ 1. Validate input fields
  if (!fullName || !email || !username || !password) {
    return next(new ApiError(400, "All fields are required"));
  }

  // ✅ 2. Check for duplicates
  const existingUser = await User.findOne({
    $or: [{ email }, { username }, { fullName }],
  });

  if (existingUser) {
    let duplicateField = "User";
    if (existingUser.email === email) duplicateField = "Email";
    else if (existingUser.username === username) duplicateField = "Username";
    else if (existingUser.fullName === fullName) duplicateField = "Full name";

    return next(new ApiError(400, `${duplicateField} already exists`));
  }

  // ✅ 3. Handle image uploads
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    return next(new ApiError(400, "Avatar image is required"));
  }

  const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
  const coverImageUpload = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

  if (!avatarUpload?.url) {
    return next(new ApiError(400, "Failed to upload avatar image"));
  }

  // ✅ 4. Create user in DB
  const newUser = await User.create({
    fullName,
    email,
    username,
    password,
    avatar: avatarUpload.url,
    coverImage: coverImageUpload?.url || "",
  });

  // ✅ 5. Return sanitized user data
  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    return next(new ApiError(500, "User not found after creation"));
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", createdUser));
});

export { registerUser };
