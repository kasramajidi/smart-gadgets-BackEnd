const yup = require("yup")


const commentSchema = yup.object().shape({
    text: yup.string().required('Comment text is required').trim(),
    email: yup.string().email('Invalid email format').required('Email is required'),
    username: yup.string().required('Username is required'),
    author: yup.string().required('Author ID is required'),
    postId: yup.string().required('Post ID is required'),
    parentComment: yup.string().nullable()
});

module.exports = commentSchema