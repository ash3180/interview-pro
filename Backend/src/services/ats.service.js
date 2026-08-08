const { GoogleGenAI } = require("@google/genai");
const { z } = require("zod");
const { zodToJsonSchema } = require("zod-to-json-schema");

function getAiClient() {
    return new GoogleGenAI({
        apiKey: process.env.GOOGLE_GENAI_API_KEY || "placeholder"
    });
}

const atsAnalysisSchema = z.object({
    targetRole: z.string().describe("Target job position title parsed from job description"),
    overallScore: z.number().describe("ATS compatibility score from 0 to 100"),
    matchBreakdown: z.object({
        keywordMatchScore: z.number().describe("0-100 score for keyword presence"),
        skillsScore: z.number().describe("0-100 score for hard & soft skills match"),
        experienceRelevanceScore: z.number().describe("0-100 score for candidate experience alignment"),
        formattingScore: z.number().describe("0-100 score for ATS parsing legibility and layout health")
    }),
    matchedKeywords: z.array(z.string()).describe("Keywords found both in resume and job description"),
    missingKeywords: z.array(z.string()).describe("Critical keywords present in job description but missing from candidate resume"),
    formattingIssues: z.array(z.string()).describe("ATS parsing warnings like multi-columns, complex graphics, tables, or missing contact info"),
    improvementSuggestions: z.array(z.object({
        category: z.string().describe("Category e.g. Summary, Experience, Skills, Project, Education"),
        recommendation: z.string().describe("Actionable recommendation to improve ATS score"),
        priority: z.enum(["high", "medium", "low"]).describe("Priority level of recommendation")
    })),
    rewrittenBullets: z.array(z.object({
        original: z.string().describe("Weak or non-ATS optimized original resume bullet point"),
        suggested: z.string().describe("High-impact, metric-driven ATS friendly rewritten bullet point"),
        reason: z.string().describe("Explanation of why the rewrite improves ATS matching and recruiter appeal")
    }))
});

async function analyzeResumeForAts({ resumeText, selfDescription, jobDescription }) {
    const prompt = `You are a Senior Technical Recruiter and ATS (Applicant Tracking System) Algorithm Expert.
Analyze the candidate's resume content against the provided Job Description:

Candidate Resume Content:
${resumeText || "Not provided directly, rely on self-description."}

Candidate Self-Description / Background:
${selfDescription || "Not provided."}

Target Job Description:
${jobDescription}

Perform a rigorous ATS audit:
1. Determine target role title.
2. Calculate overall ATS compatibility score (0 to 100) based on realistic hiring software algorithms.
3. Breakdown sub-scores: Keyword Match (0-100), Skills Match (0-100), Experience Relevance (0-100), Formatting Health (0-100).
4. Identify matched keywords and missing critical keywords.
5. Identify formatting risks (e.g. multi-columns, lack of standard headings, tables, missing metrics).
6. Provide concrete section-by-section improvement recommendations (high/medium/low priority).
7. Take 3-5 weak bullets from candidate's resume/experience and provide ATS-optimized metric-driven rewrites.`;

    const ai = getAiClient();
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zodToJsonSchema(atsAnalysisSchema)
        }
    });

    return JSON.parse(response.text);
}

module.exports = { analyzeResumeForAts };
