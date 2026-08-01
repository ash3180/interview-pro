require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

connectToDB()

if (!process.env.VERCEL) {
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        console.log(`🚀 Interview AI Pro Backend running on port ${PORT}`)
    })
}

module.exports = app
