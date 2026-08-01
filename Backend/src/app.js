const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const connectToDB = require("./config/database")

const app = express()

const clientUrlOrigins = process.env.CLIENT_URL 
    ? process.env.CLIENT_URL.split(",").map(url => url.trim().replace(/\/+$/, ""))
    : []

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    ...clientUrlOrigins
].filter(Boolean)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        const normalizedOrigin = origin.replace(/\/+$/, "");
        if (
            allowedOrigins.includes(normalizedOrigin) || 
            allowedOrigins.some(o => normalizedOrigin.startsWith(o)) ||
            normalizedOrigin.endsWith(".netlify.app") ||
            normalizedOrigin.endsWith(".vercel.app")
        ) {
            callback(null, true)
        } else {
            callback(null, true)
        }
    },
    credentials: true
}))

app.use(async (req, res, next) => {
    try {
        await connectToDB()
    } catch (err) {
        console.error("Database connection error in middleware:", err)
    }
    next()
})

app.get("/", (req, res) => {
    res.status(200).json({
        status: "online",
        name: "Interview AI Pro Backend API",
        version: "2.0.0"
    })
})

const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/interview.routes")

app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app
