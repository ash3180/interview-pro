const mongoose = require("mongoose")
const dns = require("dns")

let isConnected = false

async function connectToDB() {
    if (isConnected || mongoose.connection.readyState === 1) {
        return
    }

    try {
        if (!process.env.VERCEL && !process.env.RENDER) {
            try {
                dns.setServers(["8.8.8.8", "1.1.1.1"])
            } catch (dnsErr) {
                // Optional DNS fallback
            }
        }

        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI
        if (!mongoUri) {
            console.error("MONGO_URI (or MONGODB_URI) is missing in environment variables!")
            return
        }

        await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000
        })

        isConnected = true
        console.log("Connected to Database")
    } catch (err) {
        console.error("Database connection error:", err.message)
    }
}

module.exports = connectToDB
