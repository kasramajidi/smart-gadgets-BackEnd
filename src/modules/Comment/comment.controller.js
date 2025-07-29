const CommentModel = require('../../models/Comment');
const commentSchema = require("./comment.validation")

exports.create = async (req, res) => {
    try {
        const { text, email, username, author, postId, parentComment } = req.body;
        await commentSchema.validate({ text, email, username, author, postId, parentComment });

        const newComment = await CommentModel.create({
            text,
            email,
            username,
            author,
            postId,
            parentComment: parentComment || null
        });

        res.status(200).json({
            message: "Comment created successfully",
            comment: newComment
        });

    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.errors[0] });
        }
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.getCommentPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await CommentModel.find({
            postId: postId,
            isApproved: true
        })
            .populate('author', 'username email')
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            message: "Comments retrieved successfully",
            comments: comments,
            count: comments.length
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.replies = async (req, res) => {
    try {
        const { commentId } = req.params;

        const replies = await CommentModel.find({
            parentComment: commentId,
            isApproved: true
        })
            .populate('author', 'username email')
            .sort({ createdAt: 1 })
            .lean();

        res.status(200).json({
            message: "Replies retrieved successfully",
            replies: replies,
            count: replies.length
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { text, isApproved, isAnswered, answerText } = req.body;

        await commentSchema.validate({ text, isApproved, isAnswered, answerText });

        const existingComment = await CommentModel.findById(id);
        if (!existingComment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const updateData = {};
        if (text) updateData.text = text;
        if (typeof isApproved !== 'undefined') updateData.isApproved = isApproved;
        if (typeof isAnswered !== 'undefined') updateData.isAnswered = isAnswered;
        if (answerText) updateData.answerText = answerText;

        const updatedComment = await CommentModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('author', 'username email');

        res.status(200).json({
            message: "Comment updated successfully",
            comment: updatedComment
        });

    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.errors[0] });
        }
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

exports.remove = async (req, res) => {
    try {
        const { id } = req.params;

        const existingComment = await CommentModel.findById(id);
        if (!existingComment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        await CommentModel.findByIdAndDelete(id);

        await CommentModel.deleteMany({ parentComment: id });

        res.status(200).json({
            message: "Comment and its replies deleted successfully"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal Server Error" });
    }
}