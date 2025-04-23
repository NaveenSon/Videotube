import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,

      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudianary

      required: true,
    },
    coverImage: {
      type: String, //cloudianary
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

//here if i use aarrow fucntion instead of normal function then "this->pointer" cannot be accessed FROM USERSCHEMA.
//so we have to use normal function instead of arrow function.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //here ismodified is asviable in this function
  this.password = await bcryp.hash(this.password, 10);
  next();
});

//we cna make custom methods
userSchema.methods.isPasswordCorrect = async function (password) {
  if (password) {
    return await bcrypt.compare(password, this.password);
  }
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    procees.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: procees.env.ACCESS_TOKEN_EXPIRY,
    }
  );
  // Token generation logic here
  console.log("Refresh token generated successfully");
};
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
          _id: this._id,
         
        },
        procees.env.REFRESH_TOKEN_SECRET,
        {
          expiresIn: procees.env.REFRESH_TOKEN_EXPIRY,
        }
      );
};
export const User = mongoose.model("User", userSchema);



//jwt is bearer token like a key if u have this token   then u can access this data
