import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m"
  });
  const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d"
  });
  return { accessToken, refreshToken };
};

// save token to database
const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(
    `refresh_token:${userId}`,
    refreshToken,
    "Ex",
    7 * 24 * 60 * 60
  ); //7 days
};

// set cookies
const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true, //prevent xss attacks,  cross site Scripting attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict", // prevent CSRF attack, cross-site request forgery
    maxAge: 15 * 60 * 1000 //15 min
  });
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //prevent xss attacks,  cross site Scripting attacks
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict", // prevent CSRF attack, cross-site request forgery
    maxAge: 7 * 24 * 60 * 60 * 1000 //15 min
  });
};

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  try {
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ name, email, password });

    // authenticate User
    const { accessToken, refreshToken } = generateTokens(user._id);
    await storeRefreshToken(user._id, refreshToken);

    // set Cookies
    setCookies(res, accessToken, refreshToken);

    res.status(201).json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      message: "New User is Created!!✅"
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  res.send("login route");
};

export const logout = async (req, res) => {
  res.send("logout route");
};
