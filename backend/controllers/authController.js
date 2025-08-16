
import bcrypt from 'bcryptjs';

import jwt from 'jsonwebtoken'; 

import db from '../models/index.js';

const User = db.User;

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;


    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({ 
      message: "User created successfully!",
      user: { id: newUser.id, username: newUser.username }
    });

  } catch (error) {
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1d' } 
    );

    res.status(200).json({ 
      message: "Login successful!",
      token: token 
    });

  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};