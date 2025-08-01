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

        const isAdmin = req.user.role === "admin";
        const isCommentOwner = existingComment.author.toString() === req.user.id;

        if (!isAdmin && !isCommentOwner) {
            return res.status(403).json({
                message: "You can only delete your own comments"
            });
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

exports.isApproved = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only admins can approve/reject comments."
            });
        }

        if (typeof isApproved !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: "isApproved must be a boolean value (true/false)"
            });
        }

        const existingComment = await CommentModel.findById(id);
        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        const updatedComment = await CommentModel.findByIdAndUpdate(
            id,
            { isApproved: isApproved },
            { new: true }
        ).populate('author', 'username email');

        res.status(200).json({
            success: true,
            message: `Comment ${isApproved ? 'approved' : 'rejected'} successfully`,
            comment: updatedComment
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

exports.getAllCommentsForAdmin = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only admins can view all comments."
            });
        }

        const { postId, isApproved, page = 1, limit = 10 } = req.query;

        const filter = {};
        if (postId) filter.postId = postId;
        if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

        const skip = (page - 1) * limit;

        const comments = await CommentModel.find(filter)
            .populate('author', 'username email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const totalComments = await CommentModel.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "Comments retrieved successfully",
            comments: comments,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalComments / limit),
                totalComments: totalComments,
                hasNextPage: skip + comments.length < totalComments,
                hasPrevPage: page > 1
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

exports.answer = async (req, res) => {
    try {
        const { id } = req.params;
        const { answerText } = req.body;

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only admins can answer comments."
            });
        }

        if (!answerText || typeof answerText !== 'string' || answerText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Answer text is required and must be a non-empty string"
            });
        }

        const existingComment = await CommentModel.findById(id);
        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        const updatedComment = await CommentModel.findByIdAndUpdate(
            id,
            {
                answerText: answerText.trim(),
                isAnswered: true,
                responderId: req.user.id,
                answeredAt: new Date()
            },
            { new: true }
        ).populate('author', 'username email')
            .populate('responderId', 'username email');

        res.status(200).json({
            success: true,
            message: "Comment answered successfully",
            comment: updatedComment
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

exports.editAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const { answerText } = req.body;

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only admins can edit answers."
            });
        }

        if (!answerText || typeof answerText !== 'string' || answerText.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: "Answer text is required and must be a non-empty string"
            });
        }

        const existingComment = await CommentModel.findById(id);
        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        if (!existingComment.isAnswered) {
            return res.status(400).json({
                success: false,
                message: "This comment has no answer to edit"
            });
        }

        const updatedComment = await CommentModel.findByIdAndUpdate(
            id,
            {
                answerText: answerText.trim(),
                answeredAt: new Date() // Update timestamp
            },
            { new: true }
        ).populate('author', 'username email')
            .populate('responderId', 'username email');

        res.status(200).json({
            success: true,
            message: "Answer updated successfully",
            comment: updatedComment
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

exports.removeAnswer = async (req, res) => {
    try {
        const { id } = req.params;

        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only admins can remove answers."
            });
        }

        const existingComment = await CommentModel.findById(id);
        if (!existingComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        if (!existingComment.isAnswered) {
            return res.status(400).json({
                success: false,
                message: "This comment has no answer to remove"
            });
        }

        const updatedComment = await CommentModel.findByIdAndUpdate(
            id,
            {
                answerText: null,
                isAnswered: false,
                responderId: null,
                answeredAt: null
            },
            { new: true }
        ).populate('author', 'username email');

        res.status(200).json({
            success: true,
            message: "Answer removed successfully",
            comment: updatedComment
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

exports.unapproved = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only admins can view unapproved comments."
            });
        }

        const { postId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        const filter = { isApproved: false };
        if (postId) filter.postId = postId;

        const skip = (page - 1) * limit;

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const unapprovedComments = await CommentModel.find(filter)
            .populate('author', 'username email')
            .populate('postId', 'title')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const totalUnapproved = await CommentModel.countDocuments(filter);

        const totalComments = await CommentModel.countDocuments({});
        const approvedComments = await CommentModel.countDocuments({ isApproved: true });
        const pendingComments = totalUnapproved;

        res.status(200).json({
            success: true,
            message: "Unapproved comments retrieved successfully",
            comments: unapprovedComments,
            statistics: {
                total: totalComments,
                approved: approvedComments,
                pending: pendingComments,
                approvalRate: totalComments > 0 ? ((approvedComments / totalComments) * 100).toFixed(2) : 0
            },
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUnapproved / limit),
                totalUnapproved: totalUnapproved,
                hasNextPage: skip + unapprovedComments.length < totalUnapproved,
                hasPrevPage: page > 1,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}

exports.bulkApprove = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only admins can perform bulk operations."
            });
        }

        const { commentIds, action } = req.body;

        if (!commentIds || !Array.isArray(commentIds) || commentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Comment IDs array is required and must not be empty"
            });
        }

        if (!action || !['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: "Action must be either 'approve' or 'reject'"
            });
        }

        const existingComments = await CommentModel.find({
            _id: { $in: commentIds }
        });

        if (existingComments.length !== commentIds.length) {
            return res.status(400).json({
                success: false,
                message: "Some comment IDs are invalid"
            });
        }

        const isApproved = action === 'approve';
        const result = await CommentModel.updateMany(
            { _id: { $in: commentIds } },
            { isApproved: isApproved }
        );

        res.status(200).json({
            success: true,
            message: `${action === 'approve' ? 'Approved' : 'Rejected'} ${result.modifiedCount} comments successfully`,
            details: {
                totalRequested: commentIds.length,
                successfullyProcessed: result.modifiedCount,
                action: action
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
}