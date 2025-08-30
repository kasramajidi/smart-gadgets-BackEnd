const express = require("express");
const router = express.Router();
const productController = require("./product.controller");
const productValidation = require("./product.validation");
const AuthMiddleware = require("../../middleware/Auth");
const { adminAccessSimple } = require("../../middleware/Admin");

// روت‌های عمومی (بدون احراز هویت)
router.get("/", productController.getAllProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/discounted", productController.getDiscountedProducts);
router.get("/latest", productController.getLatestProducts);
router.get("/filters", productController.getFilters);
router.get("/slug/:slug", productController.getProductBySlug);
router.get("/:id", productController.getProductById);

// روت‌های مدیریتی (نیاز به احراز هویت ادمین)
router.post("/",
    AuthMiddleware,
    adminAccessSimple,
    productValidation.createProductValidation,
    productController.createProduct
);

router.put("/:id",
    AuthMiddleware,
    adminAccessSimple,
    productValidation.updateProductValidation,
    productController.updateProduct
);

router.patch("/:id/stock",
    AuthMiddleware,
    adminAccessSimple,
    productValidation.updateStockValidation,
    productController.updateStock
);

router.delete("/:id",
    AuthMiddleware,
    adminAccessSimple,
    productController.deleteProduct
);

module.exports = router;
