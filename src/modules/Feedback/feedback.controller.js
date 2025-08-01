const FeedbackModel = require('../../models/Feedback');
const {
    createFeedbackSchema,
    updateFeedbackSchema,
    answerFeedbackSchema,
    approveFeedbackSchema,
    bulkFeedbackSchema
} = require('./feedback.validation');

exports.create = async (req, res) => {
    try {
        const { text, firstName, lastName, email, number, type } = req.body;

        await createFeedbackSchema.validate({
            text,
            firstName,
            lastName,
            email,
            number,
            type
        });

        const newFeedback = await FeedbackModel.create({
            text: text.trim(),
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim().toLowerCase(),
            number: number.trim(),
            type,
            user: req.user.id
        });


        const populatedFeedback = await FeedbackModel.findById(newFeedback._id)
            .populate('user', 'username email');

        res.status(201).json({
            success: true,
            message: "Your feedback has been submitted successfully",
            feedback: populatedFeedback
        });

    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: err.errors[0]
            });
        }
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};


exports.getAllFeedback = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only admins can view all feedback."
            });
        }

        const { type, isApproved, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        const filter = {};
        if (type) filter.type = type;
        if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

        const skip = (page - 1) * limit;

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const feedbacks = await FeedbackModel.find(filter)
            .populate('user', 'username email')
            .populate('answeredBy', 'username email')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const totalFeedbacks = await FeedbackModel.countDocuments(filter);

        const totalCount = await FeedbackModel.countDocuments({});
        const approvedCount = await FeedbackModel.countDocuments({ isApproved: true });
        const pendingCount = await FeedbackModel.countDocuments({ isApproved: false });
        const answeredCount = await FeedbackModel.countDocuments({ answerText: { $ne: null } });

        res.status(200).json({
            success: true,
            message: "Feedbacks retrieved successfully",
            feedbacks,
            statistics: {
                total: totalCount,
                approved: approvedCount,
                pending: pendingCount,
                answered: answeredCount,
                approvalRate: totalCount > 0 ? ((approvedCount / totalCount) * 100).toFixed(2) : 0
            },
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalFeedbacks / limit),
                totalFeedbacks,
                hasNextPage: skip + feedbacks.length < totalFeedbacks,
                hasPrevPage: page > 1,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.getUnapprovedFeedback = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Only admins can view unapproved feedback."
            });
        }

        const { type, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        const filter = { isApproved: false };
        if (type) filter.type = type;

        const skip = (page - 1) * limit;

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const unapprovedFeedbacks = await FeedbackModel.find(filter)
            .populate('user', 'username email')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const totalUnapproved = await FeedbackModel.countDocuments(filter);

        res.status(200).json({
            success: true,
            message: "Unapproved feedbacks retrieved successfully",
            feedbacks: unapprovedFeedbacks,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalUnapproved / limit),
                totalUnapproved,
                hasNextPage: skip + unapprovedFeedbacks.length < totalUnapproved,
                hasPrevPage: page > 1,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        await updateFeedbackSchema.validate(updateData);

        const existingFeedback = await FeedbackModel.findById(id);
        if (!existingFeedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found"
            });
        }

        const isAdmin = req.user.role === "admin";
        const isFeedbackOwner = existingFeedback.user.toString() === req.user.id;

        if ((updateData.isApproved !== undefined || updateData.answerText) && !isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Only admins can change approval status and answers"
            });
        }

        if (!isAdmin && !isFeedbackOwner) {
            return res.status(403).json({
                success: false,
                message: "You can only edit your own feedback"
            });
        }

        const updatedFeedback = await FeedbackModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('user', 'username email')
            .populate('answeredBy', 'username email');

        res.status(200).json({
            success: true,
            message: "Feedback updated successfully",
            feedback: updatedFeedback
        });

    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: err.errors[0]
            });
        }
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

exports.getMyFeedbacks = async (req, res) => {
    try {
        const { type, isApproved, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        const filter = { user: req.user.id };
        if (type) filter.type = type;
        if (isApproved !== undefined) filter.isApproved = isApproved === 'true';

        const skip = (page - 1) * limit;

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const myFeedbacks = await FeedbackModel.find(filter)
            .populate('answeredBy', 'username email')
            .sort(sortOptions)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        const totalMyFeedbacks = await FeedbackModel.countDocuments(filter);

        const totalCount = await FeedbackModel.countDocuments({ user: req.user.id });
        const approvedCount = await FeedbackModel.countDocuments({ user: req.user.id, isApproved: true });
        const pendingCount = await FeedbackModel.countDocuments({ user: req.user.id, isApproved: false });
        const answeredCount = await FeedbackModel.countDocuments({ user: req.user.id, answerText: { $ne: null } });

        res.status(200).json({
            success: true,
            message: "Your feedbacks retrieved successfully",
            feedbacks: myFeedbacks,
            statistics: {
                total: totalCount,
                approved: approvedCount,
                pending: pendingCount,
                answered: answeredCount,
                approvalRate: totalCount > 0 ? ((approvedCount / totalCount) * 100).toFixed(2) : 0
            },
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalMyFeedbacks / limit),
                totalMyFeedbacks,
                hasNextPage: skip + myFeedbacks.length < totalMyFeedbacks,
                hasPrevPage: page > 1,
                limit: parseInt(limit)
            }
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.approveFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;

        await approveFeedbackSchema.validate({ isApproved });

        const existingFeedback = await FeedbackModel.findById(id);
        if (!existingFeedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found"
            });
        }

        const updatedFeedback = await FeedbackModel.findByIdAndUpdate(
            id,
            { isApproved },
            { new: true }
        ).populate('user', 'username email')
            .populate('answeredBy', 'username email');

        const statusMessage = isApproved ? "approved" : "rejected";

        res.status(200).json({
            success: true,
            message: `Feedback ${statusMessage} successfully`,
            feedback: updatedFeedback
        });

    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: err.errors[0]
            });
        }
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.answerFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const { answerText } = req.body;

        await answerFeedbackSchema.validate({ answerText });

        const existingFeedback = await FeedbackModel.findById(id);
        if (!existingFeedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found"
            });
        }

        const updatedFeedback = await FeedbackModel.findByIdAndUpdate(
            id,
            {
                answerText: answerText.trim(),
                answeredBy: req.user.id,
                answeredAt: new Date()
            },
            { new: true }
        ).populate('user', 'username email')
            .populate('answeredBy', 'username email');

        res.status(200).json({
            success: true,
            message: "Feedback answered successfully",
            feedback: updatedFeedback
        });

    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                success: false,
                message: err.errors[0]
            });
        }
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

exports.remove = async (req, res) => {
    try {
        const { id } = req.params;

        const existingFeedback = await FeedbackModel.findById(id);
        if (!existingFeedback) {
            return res.status(404).json({
                success: false,
                message: "Feedback not found"
            });
        }

        const isAdmin = req.user.role === "admin";
        const isFeedbackOwner = existingFeedback.user.toString() === req.user.id;

        if (!isAdmin && !isFeedbackOwner) {
            return res.status(403).json({
                success: false,
                message: "You can only delete your own feedback"
            });
        }

        await FeedbackModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Feedback deleted successfully"
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};