const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign({
        _id: user._id, username: user.username,  // Include username in JWT payload
        email: user.email, role: user.role
    }, process.env.JWTSECRET, { expiresIn: '1h' });
};

// Register API
exports.register = asyncHandler(async (req, res) => {
    // Validate input fields
    await body('username').isString().notEmpty().withMessage('Username is required').run(req);
    await body('email').isEmail().withMessage('Invalid email format').run(req);
    await body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password, email } = req.body;

        // Check if user already exists by username or email
        const existingUser = await User.findOne({
            $or: [{ username }, { email }]
        });

        if (existingUser) {
            return res.status(400).json({ error: "Username or Email is already taken" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with default role
        const newUser = new User({
            username,
            password: hashedPassword,
            email,
            role: ['reader']
        });

        // Save new user
        await newUser.save();

        // Generate token
        const token = generateToken(newUser);

        // Return token and user info (excluding password)
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                _id: newUser._id,
                username: newUser.username,
                email: newUser.email,
                roles: newUser.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Login API
exports.login = asyncHandler(async (req, res) => {
    // Validate input fields
    await body('username').isString().notEmpty().withMessage('Username is required').run(req);
    await body('password').isString().notEmpty().withMessage('Password is required').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Check if password matches
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials" });
        }

        // Generate token
        const token = generateToken(user);

        // Return token and user info (excluding password)
        res.json({
            token,
            user: {
                _id: user._id,
                username: user.username,
                email: user.email,
                roles: user.role
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

// Get Current User API
exports.getCurrentUser = asyncHandler(async (req, res) => {
    if (req.user) {
        return res.status(200).json({
            _id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            roles: req.user.role,
        });
    } else {
        return res.status(404).json({ message: 'User not found' });
    }
});
