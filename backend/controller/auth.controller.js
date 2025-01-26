import User from "../models/User.model.js";

export const signup = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  try {
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const user = await User.create({ name, email, password });

    res.status(201).json({ user, message: "New User is Created!!✅" });
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
