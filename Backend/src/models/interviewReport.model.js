const mongoose = require("mongoose")

const interviewReportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    resume: {
        type: String,
        default: ""
    },
    selfDescription: {
        type: String,
        default: ""
    },
    jobDescription: {
        type: String,
        required: true
    },
    matchScore: {
        type: Number,
        default: 75
    },
    matchBreakdown: {
        technicalFit: Number,
        experienceFit: Number,
        culturalFit: Number,
        keyStrengths: [String]
    },
    technicalQuestions: [{
        question: String,
        intention: String,
        answer: String,
        category: String
    }],
    behavioralQuestions: [{
        question: String,
        intention: String,
        answer: String,
        starTip: String
    }],
    skillGaps: [{
        skill: String,
        severity: {
            type: String,
            enum: ["low", "medium", "high"],
            default: "medium"
        },
        recommendation: String
    }],
    preparationPlan: [{
        day: Number,
        focus: String,
        tasks: [String]
    }],
    practiceSessions: [{
        question: String,
        userAnswer: String,
        score: Number,
        feedback: String,
        improvedAnswer: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true })

module.exports = mongoose.model("InterviewReport", interviewReportSchema)
