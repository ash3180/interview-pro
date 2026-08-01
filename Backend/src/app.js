const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const connectToDB = require("./config/database")

const app = express()

// Normalize Netlify Serverless Functions URL path
app.use((req, res, next) => {
    if (req.url.startsWith("/.netlify/functions/api")) {
        req.url = req.url.replace("/.netlify/functions/api", "") || "/"
    }
    next()
})

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.CLIENT_URL
].filter(Boolean)

app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))
app.use(cookieParser())

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || allowedOrigins.some(o => origin.startsWith(o))) {
            callback(null, true)
        } else {
            callback(null, true)
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"]
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
