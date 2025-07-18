const yup = require("yup")

const newLetterSchema = yup.object().shape({
    email: yup.string().email('Email is not valid').required('Email is required')
})

module.exports = newLetterSchema