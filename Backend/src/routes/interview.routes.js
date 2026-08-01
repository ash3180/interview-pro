const express = require("express")
const { authUser } = require("../middlewares/auth.middleware")
const interviewController = require("../controllers/interview.controller")
const upload = require("../middlewares/file.middleware")

const interviewRouter = express.Router()

interviewRouter.post("/", authUser, upload.single("resume"), interviewController.generateInterViewReportController)
interviewRouter.get("/", authUser, interviewController.getAllInterviewReportsController)
interviewRouter.get("/report/:interviewId", authUser, interviewController.getInterviewReportByIdController)
interviewRouter.post("/report/:interviewId/practice", authUser, interviewController.submitPracticeAnswerController)

module.exports = interviewRouter
