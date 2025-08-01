const yup = require("yup");

const createFeedbackSchema = yup.object().shape({
    text: yup
        .string()
        .required('Feedback text is required')
        .min(10, 'Feedback text must be at least 10 characters')
        .max(1000, 'Feedback text cannot exceed 1000 characters')
        .trim(),

    firstName: yup
        .string()
        .required('First name is required')
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name cannot exceed 50 characters')
        .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/, 'First name must contain only letters')
        .trim(),

    lastName: yup
        .string()
        .required('Last name is required')
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name cannot exceed 50 characters')
        .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/, 'Last name must contain only letters')
        .trim(),

    email: yup
        .string()
        .required('Email is required')
        .email('Invalid email format')
        .max(100, 'Email cannot exceed 100 characters')
        .trim(),

    number: yup
        .string()
        .required('Phone number is required')
        .matches(/^(\+98|0)?9\d{9}$/, 'Phone number must be 11 digits starting with 09')
        .trim(),

    type: yup
        .string()
        .required('Feedback type is required')
        .oneOf(['question', 'criticism', 'suggestion'], 'Feedback type must be one of: question, criticism, or suggestion')
});

const updateFeedbackSchema = yup.object().shape({
    text: yup
        .string()
        .min(10, 'Feedback text must be at least 10 characters')
        .max(1000, 'Feedback text cannot exceed 1000 characters')
        .trim(),

    firstName: yup
        .string()
        .min(2, 'First name must be at least 2 characters')
        .max(50, 'First name cannot exceed 50 characters')
        .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/, 'First name must contain only letters')
        .trim(),

    lastName: yup
        .string()
        .min(2, 'Last name must be at least 2 characters')
        .max(50, 'Last name cannot exceed 50 characters')
        .matches(/^[a-zA-Z\u0600-\u06FF\s]+$/, 'Last name must contain only letters')
        .trim(),

    email: yup
        .string()
        .email('Invalid email format')
        .max(100, 'Email cannot exceed 100 characters')
        .trim(),

    number: yup
        .string()
        .matches(/^(\+98|0)?9\d{9}$/, 'Phone number must be 11 digits starting with 09')
        .trim(),

    type: yup
        .string()
        .oneOf(['question', 'criticism', 'suggestion'], 'Feedback type must be one of: question, criticism, or suggestion'),

    isApproved: yup
        .boolean()
        .typeError('Approval status must be true or false'),

    answerText: yup
        .string()
        .min(5, 'Answer text must be at least 5 characters')
        .max(500, 'Answer text cannot exceed 500 characters')
        .trim()
});

const answerFeedbackSchema = yup.object().shape({
    answerText: yup
        .string()
        .required('Answer text is required')
        .min(5, 'Answer text must be at least 5 characters')
        .max(500, 'Answer text cannot exceed 500 characters')
        .trim()
});

const approveFeedbackSchema = yup.object().shape({
    isApproved: yup
        .boolean()
        .required('Approval status is required')
        .typeError('Approval status must be true or false')
});

const bulkFeedbackSchema = yup.object().shape({
    feedbackIds: yup
        .array()
        .of(yup.string().required('Feedback ID is required'))
        .min(1, 'At least one feedback must be selected')
        .required('Array of feedback IDs is required'),

    action: yup
        .string()
        .required('Action is required')
        .oneOf(['approve', 'reject'], 'Action must be approve or reject')
});

module.exports = {
    createFeedbackSchema,
    updateFeedbackSchema,
    answerFeedbackSchema,
    approveFeedbackSchema,
    bulkFeedbackSchema
}; 