const express = require("express")
const CommentRouter = express.Router()
const CommentController = require("./comment.controller")
const authenticationToken = require("../../middleware/Auth");

CommentRouter
    .route("/")
    .post(authenticationToken, CommentController.create)

CommentRouter
    .route('/post/:postId')
    .get(CommentController.getCommentPost)

CommentRouter
    .route("/:id/replies")
    .get(CommentController.replies)

CommentRouter
    .route("/:id")
    .patch(authenticationToken, CommentController.update)
    .delete(authenticationToken, CommentController.remove)

module.exports = CommentRouter
