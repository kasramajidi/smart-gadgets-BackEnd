const mongoose = require("mongoose");

const contentSectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    text: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        trim: true
    },
    video: {
        type: String,
        trim: true
    },
    audio: {
        type: String,
    }
}, {_id: false})

const articleSchema = new mongoose.Schema({
    title:{
        type:String,
        required: true,
        trim: true
    },
    slug:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    summery: {
        type: String,
        required: true,
        trim: true
    },
    coverImage: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ["تلفن هوشمند", "جارو هوشمند", "حلقه هوشمند", "دسته های بازی", "ساعت های هوشمند", "عینک هوشمند", "هدفون بی‌سیم"],
        required: true,
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    published: {
        type: Boolean,
        default: false
    },
    contentSections: [contentSectionSchema]
}, {timestamps: true})

const ArticleModel = mongoose.model("Article", articleSchema)

module.exports = ArticleModel