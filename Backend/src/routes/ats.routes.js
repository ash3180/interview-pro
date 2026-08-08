const express = require("express");
const { authUser } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/file.middleware");
const {
    analyzeAtsController,
    getAtsReportsController,
    getAtsReportByIdController,
    getLatexTemplatesController
} = require("../controllers/ats.controller");

const atsRouter = express.Router();

// Analyze resume against JD
atsRouter.post("/analyze", authUser, upload.single("resume"), analyzeAtsController);

// History & Report details
atsRouter.get("/reports", authUser, getAtsReportsController);
atsRouter.get("/reports/:reportId", authUser, getAtsReportByIdController);

// LaTeX resume templates library
atsRouter.get("/templates", getLatexTemplatesController);

module.exports = atsRouter;
