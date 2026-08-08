const mongoose = require("mongoose");

const atsReportSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    targetRole: {
        type: String,
        required: true,
        trim: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    resumeText: {
        type: String,
        default: ""
    },
    overallScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    matchBreakdown: {
        keywordMatchScore: { type: Number, default: 0 },
        skillsScore: { type: Number, default: 0 },
        experienceRelevanceScore: { type: Number, default: 0 },
        formattingScore: { type: Number, default: 0 }
    },
    matchedKeywords: [{ type: String }],
    missingKeywords: [{ type: String }],
    formattingIssues: [{ type: String }],
    improvementSuggestions: [{
        category: { type: String, required: true },
        recommendation: { type: String, required: true },
        priority: { type: String, enum: ["high", "medium", "low"], default: "medium" }
    }],
    rewrittenBullets: [{
        original: { type: String, required: true },
        suggested: { type: String, required: true },
        reason: { type: String, required: true }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const ATSReport = mongoose.model("ATSReport", atsReportSchema);

module.exports = ATSReport;
