const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

exports.getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

exports.getUserById = asyncHandler(async (req, res) => {
    try {
        if (req.user.role.includes('admin') || req.user._id.toString() === req.params.id) {
            const user = await User.findById(req.params.id).select('-password'); 
            if (!user) {
                return res.status(404).json({ message: "User not found!" });
            }
            res.json(user);
        } else {
            return res.status(403).json({ message: "Unauthorized access" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

exports.updateUser = asyncHandler(async (req, res) => {
    try {
        if (req.user.role.includes('admin') || req.user._id.toString() === req.params.id) {
            const updateData = req.body;

            if (req.uploadedImage) {
                updateData.avatar = req.uploadedImage.url;
            }

            if (updateData.password) {
                if (updateData.password.length < 8) {
                    return res.status(400).json({ message: "Password must be at least 8 characters long!" });
                }
                updateData.password = await bcrypt.hash(updateData.password, 10);
            }

            const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
            if (!user) {
                return res.status(404).json({ message: "User not found!" });
            }
            res.json(user);
        } else {
            return res.status(403).json({ message: "Unauthorized access" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

exports.deleteUser = asyncHandler(async (req, res) => {
    try {
        if (req.user.role.includes('admin')){
            const user = await User.findByIdAndDelete(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User not found!" });
            }
            res.json({ message: "User deleted successfully." });
        } else {
            return res.status(403).json({ message: "Unauthorized access" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

exports.createUser = asyncHandler(async (req, res) => {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required!" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format!" });
    }

    if (password.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters long!" });
    }

    const validRoles = ['admin', 'author', 'reader'];
    if (!Array.isArray(role) || !role.every(r => validRoles.includes(r))) {
        return res.status(400).json({ message: "Invalid role(s) provided!" });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return res.status(409).json({ message: "Username or email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        email,
        password: hashedPassword,
        role,
        avatar: req.uploadedImage ? req.uploadedImage.url : null 
    });

    try {
        const savedUser = await newUser.save();
        res.status(201).json({ message: "User created successfully!", user: savedUser });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});
