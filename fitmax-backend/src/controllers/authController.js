const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { saveProfile } = require('./profileController');

/**
 * Register a new user
 * @route POST /api/auth/register
 * @access Public
 */
async function register(req, res) {
    const { 
        email, 
        password, 
        is_admin,
        username,
        age,
        weight,
        diet_plan_id
    } = req.body;

    try {
        // Validate required fields
        if (!email || !password || !username || !age || !weight || !diet_plan_id) {
            return res.status(400).json({
                success: false,
                message: "All fields including username and profile info are required"
            });
        }

        // Check if email exists
        const [existingEmail] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        if (existingEmail.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Check if username exists
        const [existingUsername] = await pool.query(
            "SELECT * FROM user_profiles WHERE username = ?",
            [username]
        );
        if (existingUsername.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Username already taken"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into users table
        const [result] = await pool.query(
            "INSERT INTO users (email, password, is_admin) VALUES (?, ?, ?)",
            [email, hashedPassword, is_admin || false]
        );

        const userId = result.insertId;

        // Insert initial profile (without modifiers)
        await pool.query(
            `INSERT INTO user_profiles 
             (user_id, username, age, weight, diet_plan_id)
             VALUES (?, ?, ?, ?, ?)`,
            [userId, username, age, weight, diet_plan_id]
        );

        // Calculate and update modifiers based on diet plan
        const updatedProfile = await saveProfile({
            userId,
            body: { username, age, weight, diet_plan_id }
        });
        console.log("Profile modifiers set during registration:", updatedProfile);

        // Generate JWT token
        const token = jwt.sign(
            { id: userId, is_admin: !!is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Send registration response
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            token,
            userId,
            username,
            is_admin: !!is_admin
        });

    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

/**
 * Login user
 * @route POST /api/auth/login
 * @access Public
 */
async function login(req, res) {
    const { email, password } = req.body;

    try {
        const [rows] = await pool.query(
            `SELECT u.*, up.username
             FROM users u
             LEFT JOIN user_profiles up ON u.id = up.user_id
             WHERE u.email = ?`,
            [email]
        );

        const user = rows[0];

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: user.id, is_admin: !!user.is_admin },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            userId: user.id,
            username: user.username,
            is_admin: !!user.is_admin
        });

    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}

module.exports = { register, login };
