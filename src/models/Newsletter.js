const mongoose = require('mongoose')

const newLetterSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    subscribedAt:{
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    },
    code: {
        type: String,
        required: true
    },
    codeExpireAT: {
        type: Date
    }
})

const NewsletterModel = mongoose.model("newLetters", newLetterSchema)

module.exports = NewsletterModel