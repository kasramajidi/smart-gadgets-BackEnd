const mongoose = require("mongoose")

const commentSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },
    parentComment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
        default: null
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isAnswered: {
        type: Boolean,
        default: false
    },
    answerText: {
        type: String,
        default: null
    },
    responderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    answeredAt: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const CommentModel = mongoose.model("Comment", commentSchema)

module.exports = CommentModel