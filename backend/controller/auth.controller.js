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
        role: user.role,
        message: "New User is Created!!✅"
      }
    });
  } catch (error) {
    console.log("Error in Signup Controller", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Login

// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ email });
//     if (user && (await user.comparePassword(password))) {
//       const { accessToken, refreshToken } = generateTokens(user._id);

//       await storeRefreshToken(user._id, refreshToken);
//       setCookies(res, accessToken, refreshToken);

//       res.json({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         message: "Login successfull ✅"
//       });
//     }
//   } catch (error) {
//     console.log("Error in Login Controller", error.message);
//     res.status(500).json({ message: error.message });
//   }
// };

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user in database
    const user = await User.findOne({ email });

    // If user does not exist, return 404
    if (!user) {
      return res.status(404).json({ message: "User not found ❌" });
    }

    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Incorrect password ❌" });
    }

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user._id);

    // Store refresh token and set cookies
    await storeRefreshToken(user._id, refreshToken);
    setCookies(res, accessToken, refreshToken);

    // Return success response
    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      message: "Login successful ✅"
    });
  } catch (error) {
    console.error("Error in Login Controller:", error.message);
    return res
      .status(500)
      .json({ message: "Server error, please try again later." });
  }
};


export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
      await redis.del(`refresh_token:${decoded.userId}`);
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in Logout Controller", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// refresh the access token
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    // Debugging log
    console.log("Cookies:", req.cookies);

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    // Debugging log
    console.log("Decoded value:", decoded);

    // Retrieve the stored token from Redis
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    // Debugging log
    // console.log("Stored Token:", storedToken);
    // console.log("Provided Token:", refreshToken);

    if (storedToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    // Generate a new access token
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    // Set the new access token as a cookie
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    return res.json({ message: "Token refreshed successfully" });
  } catch (error) {
    console.log("Error in refreshToken controller:", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

// todo : implemnt get Prodile
export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (error) {
    console.log("Error in get Profile conroller", error.message);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
