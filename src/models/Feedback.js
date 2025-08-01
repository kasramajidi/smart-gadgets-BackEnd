const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["question", "criticism", "suggestion"],
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    answerText: {
        type: String,
        default: null
    },
    answeredBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    answeredAt: {
        type: Date,
        default: null
    }
}, { timestamps: true })

const FeedbackModel = mongoose.model("Feedback", feedbackSchema)

module.exports = FeedbackModel

