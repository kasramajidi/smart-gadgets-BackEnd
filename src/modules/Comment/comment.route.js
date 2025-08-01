const express = require("express")
const CommentRouter = express.Router()
const CommentController = require("./comment.controller")
const authenticationToken = require("../../middleware/Auth");
const { adminAccessSimple } = require("../../middleware/Admin");

CommentRouter
    .route("/")
    .post(authenticationToken, CommentController.create)

CommentRouter
    .route("/bulk-approve")
    .post(authenticationToken, adminAccessSimple, CommentController.bulkApprove)

CommentRouter
    .route('/post/:postId')
    .get(CommentController.getCommentPost)

CommentRouter
    .route('/admin/all')
    .get(authenticationToken, adminAccessSimple, CommentController.getAllCommentsForAdmin)

CommentRouter
    .route("/:id/replies")
    .get(CommentController.replies)

CommentRouter
    .route("/unapproved")
    .get(authenticationToken, adminAccessSimple, CommentController.unapproved)

CommentRouter
    .route("/:id")
    .patch(authenticationToken, CommentController.update)
    .delete(authenticationToken, CommentController.remove)

CommentRouter
    .route("/:id/approve")
    .patch(authenticationToken, adminAccessSimple, CommentController.isApproved)

CommentRouter
    .route("/:id/answer")
    .patch(authenticationToken, adminAccessSimple, CommentController.answer)
    .put(authenticationToken, adminAccessSimple, CommentController.editAnswer)
    .delete(authenticationToken, adminAccessSimple, CommentController.removeAnswer)




module.exports = CommentRouter
