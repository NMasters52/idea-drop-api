import express from "express";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

const router = express.Router();

// @route           POST api/auth/register
// @description     Register new user
// @access          Public

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400); // bad request status
      throw new Error("All Fields Required"); // use error handling middleware if request is bad
    }

    // check if there is an existing user using mongooses findOne method
    const existingUser = await User.findOne({ email });

    // if the user exists throw an error as this user is trying to register a new user
    if (existingUser) {
      res.status(400);
      throw new Error("User Already Exists");
    }

    // made it past all the checks. This user hasnt been created before and was successful
    const user = await User.create({ name, email, password });

    // create tokens
    const payload = { userId: user._id.toString() };
    const accessToken = await generateToken(payload, "1m");
    const refreshToken = await generateToken(payload, "30d");

    // Set Refresh Cookie to HTTP Only
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    //throw a successful status and show user information. Notice how we didnt pass User in the json. We dont want the password or the created @ in the public eye
    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export default router;
