const yup = require("yup")

const contentSectionSchema = yup.object({
    title: yup.string().required("Content section title is required").trim(),
    text: yup.string().required("Content section text is required"),
    image: yup.string().trim(),
    video: yup.string().trim(),
    audio: yup.string().trim()
})

const createArticleSchema = yup.object({
    title: yup.string()
        .required("Article title is required")
        .min(3, "Article title must be at least 3 characters")
        .max(200, "Article title cannot exceed 200 characters")
        .trim(),

    slug: yup.string()
        .required("Article slug is required")
        .matches(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers and hyphens")
        .min(3, "Slug must be at least 3 characters")
        .max(100, "Slug cannot exceed 100 characters")
        .trim(),

    summery: yup.string()
        .required("Article summary is required")
        .min(10, "Article summary must be at least 10 characters")
        .max(500, "Article summary cannot exceed 500 characters")
        .trim(),

    category: yup.string()
        .required("Article category is required")
        .oneOf([
            "تلفن هوشمند",
            "جارو هوشمند",
            "حلقه هوشمند",
            "دسته های بازی",
            "ساعت های هوشمند",
            "عینک هوشمند",
            "هدفون بی‌سیم"
        ], "Invalid category"),

    published: yup.boolean().default(false),

    contentSections: yup.array()
        .of(contentSectionSchema)
        .min(1, "At least one content section is required")
        .max(20, "Maximum 20 content sections allowed")
})

const validateFileUpload = (req, res, next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next()
    }

    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac']
    const allowedVideoTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm']

    const maxFileSize = 50 * 1024 * 1024 // 50MB

    for (const [fieldName, file] of Object.entries(req.files)) {
        if (Array.isArray(file)) {
            for (const singleFile of file) {
                if (!validateSingleFile(singleFile, allowedImageTypes, allowedAudioTypes, allowedVideoTypes, maxFileSize)) {
                    return res.status(400).json({
                        success: false,
                        message: `File ${singleFile.name} is invalid`
                    })
                }
            }
        } else {
            if (!validateSingleFile(file, allowedImageTypes, allowedAudioTypes, allowedVideoTypes, maxFileSize)) {
                return res.status(400).json({
                    success: false,
                    message: `File ${file.name} is invalid`
                })
            }
        }
    }

    next()
}

const validateSingleFile = (file, allowedImageTypes, allowedAudioTypes, allowedVideoTypes, maxFileSize) => {
    if (file.size > maxFileSize) {
        return false
    }

    if (file.fieldname.includes('image') || file.fieldname.includes('cover')) {
        return allowedImageTypes.includes(file.mimetype)
    } else if (file.fieldname.includes('audio')) {
        return allowedAudioTypes.includes(file.mimetype)
    } else if (file.fieldname.includes('video')) {
        return allowedVideoTypes.includes(file.mimetype)
    }

    return true
}

const validateCreateArticle = async (req, res, next) => {
    try {
        await createArticleSchema.validate(req.body, { abortEarly: false })
        next()
    } catch (error) {
        const errors = error.inner.map(err => ({
            field: err.path,
            message: err.message
        }))

        return res.status(400).json({
            success: false,
            message: "Data validation error",
            errors
        })
    }
}

module.exports = {
    validateCreateArticle,
    validateFileUpload,
    createArticleSchema
}