const ArticleModel = require("../../models/Article")
const fs = require("fs")
const path = require("path")

exports.create = async (req, res) => {
    try {
        const { title, slug, summery, category, published, contentSections } = req.body
        const existingArticle = await ArticleModel.findOne({ slug })
        if (existingArticle) {
            return res.status(400).json({
                success: false,
                message: "An article with this slug already exists"
            })
        }
        let processedContentSections = contentSections || []
        if (req.files && Object.keys(req.files).length > 0) {
            processedContentSections = await processFileUploads(req.files, contentSections)
        }
        const articleData = {
            title,
            slug,
            summery,
            category,
            published: published === 'true' || published === true,
            author: req.user.id,
            contentSections: processedContentSections
        }
        if (req.files && req.files.coverImage && req.files.coverImage[0]) {
            const coverImage = req.files.coverImage[0]
            const coverImagePath = await saveFile(coverImage, 'images')
            articleData.coverImage = coverImagePath
        } else {
            return res.status(400).json({
                success: false,
                message: "Cover image is required"
            })
        }
        const newArticle = new ArticleModel(articleData)
        await newArticle.save()
        res.status(201).json({
            success: true,
            message: "Article created successfully",
            data: {
                id: newArticle._id,
                title: newArticle.title,
                slug: newArticle.slug,
                category: newArticle.category,
                published: newArticle.published
            }
        })
    } catch (error) {
        console.error("Error creating article:", error)
        res.status(500).json({
            success: false,
            message: "Error creating article",
            error: error.message
        })
    }
}

exports.getAllArticles = async (req, res) => {
    try {
        const { page = 1, limit = 10, published, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query
        const filter = {}
        if (published !== undefined) filter.published = published === 'true'
        if (category) filter.category = category
        const sort = {}
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1
        const articles = await ArticleModel.find(filter)
            .populate('author', 'name email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec()
        const total = await ArticleModel.countDocuments(filter)
        res.json({
            success: true,
            data: articles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        })
    } catch (error) {
        console.error("Error getting articles:", error)
        res.status(500).json({
            success: false,
            message: "Error retrieving articles",
            error: error.message
        })
    }
}

exports.getArticleById = async (req, res) => {
    try {
        const { id } = req.params
        const article = await ArticleModel.findById(id)
            .populate('author', 'name email')
        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article not found"
            })
        }
        res.json({
            success: true,
            data: article
        })
    } catch (error) {
        console.error("Error getting article:", error)
        res.status(500).json({
            success: false,
            message: "Error retrieving article",
            error: error.message
        })
    }
}

exports.getArticleBySlug = async (req, res) => {
    try {
        const { slug } = req.params
        const article = await ArticleModel.findOne({ slug, published: true })
            .populate('author', 'name email')
        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article not found or not published"
            })
        }
        res.json({
            success: true,
            data: article
        })
    } catch (error) {
        console.error("Error getting article by slug:", error)
        res.status(500).json({
            success: false,
            message: "Error retrieving article",
            error: error.message
        })
    }
}

exports.getArticlesByCategory = async (req, res) => {
    try {
        const { category } = req.params
        const { page = 1, limit = 10, published = 'true' } = req.query
        const filter = { category, published: published === 'true' }
        const articles = await ArticleModel.find(filter)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec()
        const total = await ArticleModel.countDocuments(filter)
        res.json({
            success: true,
            data: articles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        })
    } catch (error) {
        console.error("Error getting articles by category:", error)
        res.status(500).json({
            success: false,
            message: "Error retrieving articles by category",
            error: error.message
        })
    }
}

exports.searchArticles = async (req, res) => {
    try {
        const { q, page = 1, limit = 10, published = 'true' } = req.query
        if (!q) {
            return res.status(400).json({
                success: false,
                message: "Search query is required"
            })
        }
        const filter = {
            published: published === 'true',
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { summery: { $regex: q, $options: 'i' } },
                { 'contentSections.text': { $regex: q, $options: 'i' } }
            ]
        }
        const articles = await ArticleModel.find(filter)
            .populate('author', 'name email')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec()
        const total = await ArticleModel.countDocuments(filter)
        res.json({
            success: true,
            data: articles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        })
    } catch (error) {
        console.error("Error searching articles:", error)
        res.status(500).json({
            success: false,
            message: "Error searching articles",
            error: error.message
        })
    }
}

exports.getPublishedArticles = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query
        const sort = {}
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1
        const articles = await ArticleModel.find({ published: true })
            .populate('author', 'name email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec()
        const total = await ArticleModel.countDocuments({ published: true })
        res.json({
            success: true,
            data: articles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        })
    } catch (error) {
        console.error("Error retrieving published articles:", error)
        res.status(500).json({
            success: false,
            message: "Error retrieving published articles",
            error: error.message
        })
    }
}

exports.getUnpublishedArticles = async (req, res) => {
    try {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query
        const sort = {}
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1
        const articles = await ArticleModel.find({ published: false })
            .populate('author', 'name email')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec()
        const total = await ArticleModel.countDocuments({ published: false })
        res.json({
            success: true,
            data: articles,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        })
    } catch (error) {
        console.error("Error retrieving unpublished articles:", error)
        res.status(500).json({
            success: false,
            message: "Error retrieving unpublished articles",
            error: error.message
        })
    }
}

exports.updateArticle = async (req, res) => {
    try {
        const { id } = req.params
        const updateData = req.body
        const existingArticle = await ArticleModel.findById(id)
        if (!existingArticle) {
            return res.status(404).json({
                success: false,
                message: "Article not found"
            })
        }
        if (updateData.slug && updateData.slug !== existingArticle.slug) {
            const slugExists = await ArticleModel.findOne({ slug: updateData.slug, _id: { $ne: id } })
            if (slugExists) {
                return res.status(400).json({
                    success: false,
                    message: "An article with this slug already exists"
                })
            }
        }
        if (req.files && Object.keys(req.files).length > 0) {
            if (req.files.coverImage && req.files.coverImage[0]) {
                const coverImage = req.files.coverImage[0]
                const coverImagePath = await saveFile(coverImage, 'images')
                updateData.coverImage = coverImagePath
            }
            if (updateData.contentSections) {
                updateData.contentSections = await processFileUploads(req.files, updateData.contentSections)
            }
        }
        const updatedArticle = await ArticleModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('author', 'name email')
        res.json({
            success: true,
            message: "Article updated successfully",
            data: updatedArticle
        })
    } catch (error) {
        console.error("Error updating article:", error)
        res.status(500).json({
            success: false,
            message: "Error updating article",
            error: error.message
        })
    }
}

exports.deleteArticle = async (req, res) => {
    try {
        const { id } = req.params
        const article = await ArticleModel.findById(id)
        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article not found"
            })
        }
        await deleteArticleFiles(article)
        await ArticleModel.findByIdAndDelete(id)
        res.json({
            success: true,
            message: "Article deleted successfully"
        })
    } catch (error) {
        console.error("Error deleting article:", error)
        res.status(500).json({
            success: false,
            message: "Error deleting article",
            error: error.message
        })
    }
}

exports.togglePublished = async (req, res) => {
    try {
        const { id } = req.params
        const article = await ArticleModel.findById(id)
        if (!article) {
            return res.status(404).json({
                success: false,
                message: "Article not found"
            })
        }
        article.published = !article.published
        await article.save()
        res.json({
            success: true,
            message: `Article ${article.published ? 'published' : 'unpublished'} successfully`,
            data: {
                id: article._id,
                published: article.published
            }
        })
    } catch (error) {
        console.error("Error toggling article published status:", error)
        res.status(500).json({
            success: false,
            message: "Error updating article status",
            error: error.message
        })
    }
}

async function processFileUploads(files, contentSections) {
    const processedSections = []
    for (let i = 0; i < contentSections.length; i++) {
        const section = contentSections[i]
        const processedSection = { ...section }
        if (files[`contentSections[${i}][image]`] && files[`contentSections[${i}][image]`][0]) {
            const imageFile = files[`contentSections[${i}][image]`][0]
            const imagePath = await saveFile(imageFile, 'images')
            processedSection.image = imagePath
        }
        if (files[`contentSections[${i}][video]`] && files[`contentSections[${i}][video]`][0]) {
            const videoFile = files[`contentSections[${i}][video]`][0]
            const videoPath = await saveFile(videoFile, 'Video')
            processedSection.video = videoPath
        }
        if (files[`contentSections[${i}][audio]`] && files[`contentSections[${i}][audio]`][0]) {
            const audioFile = files[`contentSections[${i}][audio]`][0]
            const audioPath = await saveFile(audioFile, 'Audio')
            processedSection.audio = audioPath
        }
        processedSections.push(processedSection)
    }
    return processedSections
}

async function saveFile(file, folderType) {
    try {
        const uploadDir = path.join(process.cwd(), 'public', folderType)
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true })
        }
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = path.extname(file.originalname || 'file')
        const fileName = `${timestamp}_${randomString}${fileExtension}`
        const filePath = path.join(uploadDir, fileName)
        fs.writeFileSync(filePath, file.buffer)
        return `${folderType}/${fileName}`
    } catch (error) {
        console.error(`Error saving file to ${folderType}:`, error)
        throw new Error(`Error saving file to folder ${folderType}`)
    }
}

async function deleteArticleFiles(article) {
    try {
        if (article.coverImage) {
            const coverImagePath = path.join(process.cwd(), 'public', article.coverImage)
            if (fs.existsSync(coverImagePath)) {
                fs.unlinkSync(coverImagePath)
            }
        }
        if (article.contentSections) {
            for (const section of article.contentSections) {
                if (section.image) {
                    const imagePath = path.join(process.cwd(), 'public', section.image)
                    if (fs.existsSync(imagePath)) {
                        fs.unlinkSync(imagePath)
                    }
                }
                if (section.video) {
                    const videoPath = path.join(process.cwd(), 'public', section.video)
                    if (fs.existsSync(videoPath)) {
                        fs.unlinkSync(videoPath)
                    }
                }
                if (section.audio) {
                    const audioPath = path.join(process.cwd(), 'public', section.audio)
                    if (fs.existsSync(audioPath)) {
                        fs.unlinkSync(audioPath)
                    }
                }
            }
        }
    } catch (error) {
        console.error("Error deleting article files:", error)
    }
}