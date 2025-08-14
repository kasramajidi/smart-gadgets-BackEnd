const express = require("express")
const ArticleController = require("./article.controller")
const ArticleRouter = express.Router()
const authenticationToken = require("../../middleware/Auth");
const { adminAccessSimple } = require("../../middleware/Admin");
const { validateCreateArticle, validateFileUpload } = require("./article.validation");
const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024,
    }
});

const createUploadFields = (maxSections = 50) => {
    const fields = [
        { name: 'coverImage', maxCount: 1 }
    ];
    for (let i = 0; i < maxSections; i++) {
        fields.push(
            { name: `contentSections[${i}][image]`, maxCount: 1 },
            { name: `contentSections[${i}][video]`, maxCount: 1 },
            { name: `contentSections[${i}][audio]`, maxCount: 1 }
        );
    }
    return fields;
};

const uploadFields = upload.fields(createUploadFields(50));
const uploadAny = upload.any();

ArticleRouter
    .route("/")
    .get(ArticleController.getAllArticles)

ArticleRouter
    .route("/published")
    .get(ArticleController.getPublishedArticles)

ArticleRouter
    .route("/unpublished")
    .get(ArticleController.getUnpublishedArticles)

ArticleRouter
    .route("/search")
    .get(ArticleController.searchArticles)

ArticleRouter
    .route("/category/:category")
    .get(ArticleController.getArticlesByCategory)

ArticleRouter
    .route("/slug/:slug")
    .get(ArticleController.getArticleBySlug)

ArticleRouter
    .route("/:id")
    .get(ArticleController.getArticleById)

ArticleRouter
    .route("/create")
    .post(
        authenticationToken,
        adminAccessSimple,
        uploadAny,
        validateFileUpload,
        validateCreateArticle,
        ArticleController.create
    )

ArticleRouter
    .route("/:id")
    .put(
        authenticationToken,
        adminAccessSimple,
        uploadAny,
        validateFileUpload,
        ArticleController.updateArticle
    )

ArticleRouter
    .route("/:id")
    .delete(
        authenticationToken,
        adminAccessSimple,
        ArticleController.deleteArticle
    )

ArticleRouter
    .route("/:id/toggle-published")
    .patch(
        authenticationToken,
        adminAccessSimple,
        ArticleController.togglePublished
    )

module.exports = ArticleRouter