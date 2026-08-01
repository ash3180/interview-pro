const User = require("../models/user.model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body

        if (!username || !email || !password) {
            return res.status(400).json({ message: "Username, email and password are required." })
        }

        const existingUser = await User.findOne({ $or: [{ email }, { username }] })
        if (existingUser) {
            return res.status(400).json({ message: "An account with this email or username already exists." })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({
            username,
            email,
            password: hashedPassword
        })

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" || !!process.env.VERCEL,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(201).json({
            message: "Registration successful.",
            token,
            user: { id: user._id, username: user.username, email: user.email }
        })
    } catch (err) {
        console.error("Register Error:", err)
        res.status(500).json({ message: "Server error during registration." })
    }
}

async function loginUserController(req, res) {
    try {
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password." })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password." })
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production" || !!process.env.VERCEL,
            sameSite: "none",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({
            message: "Login successful.",
            token,
            user: { id: user._id, username: user.username, email: user.email }
        })
    } catch (err) {
        console.error("Login Error:", err)
        res.status(500).json({ message: "Server error during login." })
    }
}

async function logoutUserController(req, res) {
    res.clearCookie("token")
    res.status(200).json({ message: "Logged out successfully." })
}

async function getMeController(req, res) {
    try {
        const user = await User.findById(req.user.id).select("-password")
        if (!user) {
            return res.status(404).json({ message: "User not found." })
        }
        res.status(200).json({ user })
    } catch (err) {
        res.status(500).json({ message: "Error fetching user profile." })
    }
}

module.exports = { registerUserController, loginUserController, logoutUserController, getMeController }
