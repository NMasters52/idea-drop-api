import express from "express";
import User from "../models/User.js";
import { jwtVerify } from "jose";
import { JWT_SECRET } from "../utils/getJwtSecret.js";
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

// @route           POST api/auth/login
// @description     Authenticate user
// @access          Public

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("email and password are required");
    }

    // find user
    const user = await User.findOne();

    if (!user) {
      res.status(401);
      throw new Error("Invalid Credentials");
    }

    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      throw new Error("Invalid Credentials");
    }

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

// @route           POST api/auth/logout
// @description     Logout user and refresh token
// @access          private

router.post("/logout", (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "none",
  });

  res.status(200).json({ message: "Logged out successfully" });
});

// @route           POST api/auth/refresh
// @description     Generate New access from refresh token
// @access          Public (needs valid refresh token in cookie)
router.post("/refresh", async (res, req, next) => {
  try {
    const token = req.cookies?.refreshToken;
    console.log("Refreshing Token...");

    if (!token) {
      res.status(401);
      throw new Error("No refresh token");
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    const user = await User.findById(payload.userId);

    if (!user) {
      res.status(401);
      throw new Error("No User");
    }

    const newAccessToken = await generateToken(
      { userId: user._id.toString() },
      "1m"
    );

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(401);
    next(err);
  }
});

export default router;
