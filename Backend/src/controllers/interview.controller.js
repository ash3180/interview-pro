const pdfParse = require("pdf-parse")
const { generateInterviewReport, evaluatePracticeAnswer } = require("../services/ai.service")
const InterviewReport = require("../models/interviewReport.model")

async function generateInterViewReportController(req, res) {
    try {
        const { selfDescription, jobDescription } = req.body

        if (!jobDescription) {
            return res.status(400).json({ message: "Job description is required." })
        }

        let extractedText = ""
        if (req.file && req.file.buffer) {
            try {
                if (typeof pdfParse === 'function') {
                    const parsed = await pdfParse(req.file.buffer)
                    extractedText = parsed.text || ""
                } else if (pdfParse.PDFParse) {
                    const parser = new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))
                    const parsed = await parser.getText()
                    extractedText = parsed.text || ""
                }
            } catch (pdfErr) {
                console.error("PDF parse warning:", pdfErr)
            }
        }

        if (!extractedText && !selfDescription) {
            return res.status(400).json({ message: "Please upload a resume PDF or provide a self-description." })
        }

        const aiOutput = await generateInterviewReport({
            resume: extractedText,
            selfDescription: selfDescription || "",
            jobDescription
        })

        const interviewReport = await InterviewReport.create({
            user: req.user.id,
            resume: extractedText,
            selfDescription: selfDescription || "",
            jobDescription,
            ...aiOutput
        })

        res.status(201).json({
            message: "Interview strategy report generated successfully.",
            interviewReport
        })
    } catch (err) {
        console.error("Generate Report Error:", err)
        res.status(500).json({ message: err.message || "Failed to generate interview report." })
    }
}

async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params
        const interviewReport = await InterviewReport.findOne({ _id: interviewId, user: req.user.id })

        if (!interviewReport) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        res.status(200).json({ interviewReport })
    } catch (err) {
        res.status(500).json({ message: "Error fetching report." })
    }
}

async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await InterviewReport.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("_id title matchScore matchBreakdown createdAt")

        res.status(200).json({ interviewReports })
    } catch (err) {
        res.status(500).json({ message: "Error fetching user reports." })
    }
}

async function submitPracticeAnswerController(req, res) {
    try {
        const { interviewId } = req.params
        const { question, userAnswer } = req.body

        if (!question || !userAnswer) {
            return res.status(400).json({ message: "Question and user answer are required." })
        }

        const report = await InterviewReport.findOne({ _id: interviewId, user: req.user.id })
        if (!report) {
            return res.status(404).json({ message: "Interview report not found." })
        }

        const evaluation = await evaluatePracticeAnswer({
            question,
            userAnswer,
            jobDescription: report.jobDescription
        })

        const session = {
            question,
            userAnswer,
            score: evaluation.score,
            feedback: evaluation.feedback,
            improvedAnswer: evaluation.improvedAnswer
        }

        report.practiceSessions.push(session)
        await report.save()

        res.status(200).json({
            message: "Practice answer evaluated successfully.",
            evaluation,
            report
        })
    } catch (err) {
        console.error("Practice Answer Error:", err)
        res.status(500).json({ message: "Error evaluating practice response." })
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    submitPracticeAnswerController
}
