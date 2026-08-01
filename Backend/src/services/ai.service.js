const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")

function getAiClient() {
    return new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY || "placeholder"
    })
}

const interviewReportSchema = z.object({
    title: z.string().describe("Job title or candidate position title based on Job Description"),
    matchScore: z.number().describe("Overall score 0-100 matching resume to job description"),
    matchBreakdown: z.object({
        technicalFit: z.number().describe("0-100 score for technical skills fit"),
        experienceFit: z.number().describe("0-100 score for experience fit"),
        culturalFit: z.number().describe("0-100 score for soft skills & cultural fit"),
        keyStrengths: z.array(z.string()).describe("Top 3 candidate strengths for this role")
    }),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("Technical interview question"),
        intention: z.string().describe("Interviewer intention behind asking this question"),
        answer: z.string().describe("Ideal structured answer and points to cover"),
        category: z.string().describe("Category e.g. Frontend, System Design, Algorithms")
    })),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("Behavioral interview question"),
        intention: z.string().describe("Interviewer intention"),
        answer: z.string().describe("Sample STAR method response"),
        starTip: z.string().describe("Key tip for applying the STAR technique to this question")
    })),
    skillGaps: z.array(z.object({
        skill: z.string().describe("Missing or under-represented skill"),
        severity: z.enum(["low", "medium", "high"]).describe("Severity level"),
        recommendation: z.string().describe("Actionable learning recommendation")
    })),
    preparationPlan: z.array(z.object({
        day: z.number().describe("Day number starting from 1 up to 7"),
        focus: z.string().describe("Primary daily focus area"),
        tasks: z.array(z.string()).describe("Checklist of specific tasks")
    }))
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `You are a World-Class Technical Recruiter and Hiring Manager. Analyze the candidate and job details below:
Resume Content: ${resume || "Not provided"}
Self Description: ${selfDescription || "Not provided"}
Job Description: ${jobDescription}

Generate an exhaustive, highly accurate interview strategy report.`

    const ai = getAiClient()
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(interviewReportSchema)
        }
    })

    return JSON.parse(response.text)
}

const practiceFeedbackSchema = z.object({
    score: z.number().describe("Answer quality score from 0 to 100"),
    feedback: z.string().describe("Detailed constructive feedback highlighting pros and missed points"),
    improvedAnswer: z.string().describe("Refined exemplar answer incorporating candidate's real experience")
})

async function evaluatePracticeAnswer({ question, userAnswer, jobDescription }) {
    const prompt = `Evaluate the candidate's mock interview answer for the following question:
Question: ${question}
Candidate's Answer: ${userAnswer}
Target Job Context: ${jobDescription}

Provide a score out of 100, actionable feedback, and an improved exemplar response.`

    const ai = getAiClient()
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(practiceFeedbackSchema)
        }
    })

    return JSON.parse(response.text)
}

module.exports = { generateInterviewReport, evaluatePracticeAnswer }
