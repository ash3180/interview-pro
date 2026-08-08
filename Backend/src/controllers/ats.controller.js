const pdfParse = require("pdf-parse");
const { analyzeResumeForAts } = require("../services/ats.service");
const ATSReport = require("../models/atsReport.model");

// Pre-stored battle-tested ATS-friendly LaTeX resume templates
const LATEX_TEMPLATES = [
    {
        id: "jakes-resume",
        name: "Jake's Resume (Gold Standard Tech)",
        category: "Software Engineering",
        description: "The most popular ATS-friendly single-column resume template. Clean typography, standard section headers, 99%+ parsing accuracy on Greenhouse, Workday, and Lever.",
        tags: ["Single Column", "Popular", "High ATS Match", "Software Engineer"],
        code: `%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{} 
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\vspace{-6pt}\\hrule height 1pt \\vspace{2pt}]

%-------------------------
% Custom commands
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabularx}{\\textwidth}[t]{X r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabularx}\\vspace{-5pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%

\\begin{document}

\\begin{center}
    \\textbf{\\Huge \\scshape Full Name} \\\\ \\vspace{1pt}
    \\small 123-456-7890 $|$ \\href{mailto:email@example.com}{\\underline{email@example.com}} $|$ 
    \\href{https://linkedin.com/in/username}{\\underline{linkedin.com/in/username}} $|$
    \\href{https://github.com/username}{\\underline{github.com/username}}
\\end{center}

%-----------EDUCATION-----------
\\section{Education}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {University Name}{City, State}
      {Bachelor of Science in Computer Science}{Aug. 2020 -- May 2024}
  \\resumeSubHeadingListEnd

%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {Software Engineer Intern}{May 2023 -- Aug 2023}
      {Tech Company Name}{City, State}
      \\resumeItemListStart
        \\resumeItem{Developed a microservice architecture using Node.js and TypeScript, reducing API latency by 35\\%.}
        \\resumeItem{Optimized PostgreSQL query performance, improving data throughput for over 100,000 active users.}
        \\resumeItem{Collaborated with cross-functional teams to implement OAuth2 authentication pipeline.}
      \\resumeItemListEnd

    \\resumeSubheading
      {Full Stack Developer}{Jan 2022 -- May 2023}
      {Startup / University Lab}{City, State}
      \\resumeItemListStart
        \\resumeItem{Built responsive React web interfaces integrated with RESTful endpoints, increasing user engagement by 20\\%.}
        \\resumeItem{Integrated automated Jest unit test suites achieving 90\\% code coverage.}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd

%-----------PROJECTS-----------
\\section{Projects}
  \\resumeSubHeadingListStart
    \\resumeSubheading
      {AI Interview Assistant}{React, Express, MongoDB, OpenAI API}
      {Personal Project}{2024}
      \\resumeItemListStart
        \\resumeItem{Designed and deployed an AI mock interview practice web application for over 500 active candidates.}
        \\resumeItem{Implemented real-time feedback processing with custom Zod schema validation.}
      \\resumeItemListEnd
  \\resumeSubHeadingListEnd

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     \\textbf{Languages}{: JavaScript, TypeScript, Python, C++, SQL, HTML/CSS} \\\\
     \\textbf{Frameworks}{: React, Node.js, Express, Next.js, Tailwind CSS} \\\\
     \\textbf{Developer Tools}{: Git, Docker, AWS, MongoDB, VS Code, Postman}
    }}
 \\end{itemize}

\\end{document}
`
    }
];


async function analyzeAtsController(req, res) {
    try {
        const { jobDescription, selfDescription } = req.body;

        if (!jobDescription || jobDescription.trim().length < 20) {
            return res.status(400).json({ message: "Please provide a valid target Job Description (at least 20 characters)." });
        }

        let extractedText = "";
        if (req.file && req.file.buffer) {
            try {
                if (typeof pdfParse === 'function') {
                    const parsed = await pdfParse(req.file.buffer);
                    extractedText = parsed.text || "";
                } else if (pdfParse.PDFParse) {
                    const parser = new pdfParse.PDFParse(Uint8Array.from(req.file.buffer));
                    const parsed = await parser.getText();
                    extractedText = parsed.text || "";
                }
            } catch (pdfErr) {
                console.error("ATS PDF parse warning:", pdfErr);
            }
        }

        if (!extractedText && !selfDescription) {
            return res.status(400).json({ message: "Please upload a resume PDF or provide a self-description of your experience." });
        }

        // Call Gemini ATS analysis service
        const aiOutput = await analyzeResumeForAts({
            resumeText: extractedText,
            selfDescription: selfDescription || "",
            jobDescription
        });

        // Save report to database
        const atsReport = await ATSReport.create({
            user: req.user.id,
            targetRole: aiOutput.targetRole || "Target Position",
            jobDescription,
            resumeText: extractedText,
            overallScore: aiOutput.overallScore,
            matchBreakdown: aiOutput.matchBreakdown,
            matchedKeywords: aiOutput.matchedKeywords || [],
            missingKeywords: aiOutput.missingKeywords || [],
            formattingIssues: aiOutput.formattingIssues || [],
            improvementSuggestions: aiOutput.improvementSuggestions || [],
            rewrittenBullets: aiOutput.rewrittenBullets || []
        });

        res.status(201).json({
            message: "ATS analysis completed successfully.",
            atsReport
        });

    } catch (err) {
        console.error("ATS Analysis Controller Error:", err);
        res.status(500).json({ message: err.message || "Failed to analyze resume for ATS." });
    }
}

async function getAtsReportsController(req, res) {
    try {
        const reports = await ATSReport.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .select("_id targetRole overallScore matchBreakdown createdAt");

        res.status(200).json({ reports });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch ATS history." });
    }
}

async function getAtsReportByIdController(req, res) {
    try {
        const { reportId } = req.params;
        const report = await ATSReport.findOne({ _id: reportId, user: req.user.id });

        if (!report) {
            return res.status(404).json({ message: "ATS Report not found." });
        }

        res.status(200).json({ atsReport: report });
    } catch (err) {
        res.status(500).json({ message: "Error fetching ATS Report." });
    }
}

async function getLatexTemplatesController(req, res) {
    try {
        res.status(200).json({ templates: LATEX_TEMPLATES });
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch LaTeX templates." });
    }
}

module.exports = {
    analyzeAtsController,
    getAtsReportsController,
    getAtsReportByIdController,
    getLatexTemplatesController,
    LATEX_TEMPLATES
};
