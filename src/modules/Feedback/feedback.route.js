const express = require("express")
const FeedbackRouter = express.Router()
const FeedbackController = require("./feedback.controller")
const authenticationToken = require("../../middleware/Auth");
const { adminAccessSimple } = require("../../middleware/Admin");

FeedbackRouter
    .route("/")
    .post(authenticationToken, FeedbackController.create)
    .get(authenticationToken, adminAccessSimple, FeedbackController.getAllFeedback)

FeedbackRouter
    .route("/unapproved")
    .get(authenticationToken, adminAccessSimple, FeedbackController.getUnapprovedFeedback)

FeedbackRouter
    .route("/mine")
    .get(authenticationToken, FeedbackController.getMyFeedbacks)

FeedbackRouter
    .route("/:id")
    .patch(authenticationToken, FeedbackController.update)
    .delete(authenticationToken, FeedbackController.remove)

FeedbackRouter
    .route("/:id/approve")
    .patch(authenticationToken, adminAccessSimple, FeedbackController.approveFeedback)

FeedbackRouter
    .route("/:id/answer")
    .patch(authenticationToken, adminAccessSimple, FeedbackController.answerFeedback)

module.exports = FeedbackRouter