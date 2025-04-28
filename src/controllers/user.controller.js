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

const AccessAndRefreshtoken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    user.save({ validateBeforeSave: false }); //here it means without check validationd data will be saved
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "something went wrong while fetching the access and refresh token",
    );
  }
};

// Register new user
const registerUser = asyncHandler(async (req, res, next) => { 
  // console.log(req.body)
  const { fullName, password, email, username } = req.body;

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
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //   const coverImageLocalPath = req.files?.coverImage[0]?.path;  //if i use this line of code then it will throw error

  let coverImageLocalPath; //thats why i use this code

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    return next(new ApiError(400, "Avatar image is required"));
  }
  console.log(avatarLocalPath);
  const avatarUpload = await uploadOnCloudinary(avatarLocalPath);
  const coverImageUpload = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatarUpload) {
    console.log(avatarUpload);
    throw new ApiError(400, "Failed to upload avatar image");
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





const loginUser = asyncHandler(async (req, res) => {
    console.log("req.bodyss",req.body); 
  const { username, email, password } = req.body;
  if (!(username || email)) {
    throw new ApiError(400, "username or email is required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  
  console.log(user);
  if (!user) {
    throw new ApiError(404, "user does not exist");
  }

  const isPassowrdValid = await user.isPasswordCorrect(password);

  if (!isPassowrdValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await AccessAndRefreshtoken(user._id);

  const LoggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          user: LoggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});


const  logoutUser = asyncHandler(async (req, res) => {
          await  User.findByIdAndUpdate(
                req.user._id,
                {
                    $set: {
                        refreshToken: undefined
                    }

                },
                {
                    new :true
                }
            )

            const options = {
                httpOnly: true,
                secure: true,
            };
            return res
                .clearCookie("accessToken", options)
                .clearCookie("refreshToken", options)
                .status(200)
                .json(new ApiResponse(200, "User logged out successfully")); 
});





export { registerUser, loginUser ,logoutUser };

//always make commnets before starting the code of routes alwayds remember