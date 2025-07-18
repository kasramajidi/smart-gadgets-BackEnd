const yup = require("yup")

const signUpSchema = yup.object().shape({
    username: yup.string().required('Username is required').min(3),
    email: yup.string().email('Email is not valid').required('Email is required'),
    password: yup.string().min(8, 'Password must be at least 6 characters').max(15, 'Password must be a maximum of 6 characters').required('Password is required')
})

const loginSchema = yup.object().shape({
    email: yup.string().email('Email is not valid').required('Email is required'),
    password: yup.string().min(8, 'Password must be at least 6 characters').max(15, 'Password must be a maximum of 6 characters').required('Password is required')
})


const removeUserSchema = yup.object().shape({
    email: yup.string().email('Email is not valid').required('Email is required')
})

const updateUserSchema = yup.object().shape({
    username: yup.string().required('Username is required').min(3),
    email: yup.string().email('Email is not valid').required('Email is required'),
    password: yup.string().min(8, 'Password must be at least 6 characters').max(15, 'Password must be a maximum of 6 characters').required('Password is required')
})

const findOneUserSchema = yup.object().shape({
    email: yup.string().email('Email is not valid').required('Email is required')
})

module.exports = { signUpSchema, loginSchema, findOneUserSchema, removeUserSchema, updateUserSchema }